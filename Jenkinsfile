pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        GIT_REPO_NAME = "TODO-Manifest"
        GIT_USER_NAME = "satyatulasijalandharch"
        SCANNER_HOME = tool 'sonar-scanner'
        APP_NAME = "TODO-Backend"
        RELEASE = "1.0"
        DOCKER_USER = "mrstjch"
        IMAGE_NAME = "${DOCKER_USER}"
        IMAGE_TAG = "${RELEASE}.${BUILD_NUMBER}"
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Backend Dependencies') {
            steps {
                sh "npm ci"
            }
        }
        stage('Sonarqube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=TODO-Backend -Dsonar.projectKey=TODO-Backend"
                }
            }
        }
        stage('Quality Gate') {
            steps {
                waitForQualityGate abortPipeline: false, credentialsId: 'sonar'
            }
        }
        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        stage('Backend Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'dockerhub', toolName: 'docker') {
                        dir('TODO-APP/backend') {
                            sh "docker build -t ${IMAGE_NAME}/todo-backend:${IMAGE_TAG} -t ${IMAGE_NAME}/todo-backend:latest ."
                            sh "docker push ${IMAGE_NAME}/todo-backend:${IMAGE_TAG}"
                            sh "docker push ${IMAGE_NAME}/todo-backend:latest"
                        }
                    }
                }
            }
        }
        stage('TRIVY Backend Image Scan') {
            steps {
                sh "trivy image ${IMAGE_NAME}/todo-backend:${IMAGE_TAG} > todo-backend-trivy.txt"
            }
        }
        stage("TODO-Manifest Checkout") {
            steps {
                git branch: 'main', url: 'https://github.com/satyatulasijalandharch/TODO-Manifest.git'
            }
        }
        stage('Deploy to TODO-Manifest') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GITHUB_USERNAME', passwordVariable: 'GITHUB_TOKEN')]) {
                        sh "sed -Ei '/- name: mrstjch\\/todo-backend\$/{n;s/\\w+\$/\\${IMAGE_TAG}/}' ./deployments/node-app/kustomization.yaml"

                        // Git commands to stage, commit, and push the changes
                        sh 'git add .'
                        sh "git commit -m 'Update image to ${IMAGE_TAG}'"
                        sh "git push https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main"
                    }
                }
            }
        }
    }
    post {
        success {
            script {
                def attachments = [
                    [
                        "color": "good",
                        "text": "Build Successful",
                        "fields": [
                            ["title": "Project", "value": "${env.JOB_NAME}", "short": true],
                            ["title": "Build Number", "value": "${env.BUILD_NUMBER}", "short": true],
                            ["title": "URL", "value": "${env.BUILD_URL}", "short": false]
                        ]
                    ]
                ]
                slackSend color: 'good', channel: '#devops', attachments: attachments
                slackUploadFile filePath: "trivyfs.txt", initialComment: "TRIVY FS Scan Results (Backend)"
                slackUploadFile filePath: "todo-backend-trivy.txt", initialComment: "TRIVY Backend Image Scan Results"
            }
        }
        failure {
            script {
                def attachments = [
                    [
                        "color": "danger",
                        "text": "Build Failed",
                        "fields": [
                            ["title": "Project", "value": "${env.JOB_NAME}", "short": true],
                            ["title": "Build Number", "value": "${env.BUILD_NUMBER}", "short": true],
                            ["title": "URL", "value": "${env.BUILD_URL}", "short": false]
                        ]
                    ]
                ]
                slackSend color: 'danger', channel: '#devops', attachments: attachments
                slackUploadFile filePath: "trivyfs.txt", initialComment: "TRIVY FS Scan Results (Backend)"
                slackUploadFile filePath: "todo-backend-trivy.txt", initialComment: "TRIVY Backend Image Scan Results"
            }
        }
    }
}
