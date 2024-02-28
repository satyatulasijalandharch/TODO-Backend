FROM node:16-alpine
# Set the working directory
WORKDIR /app

# install dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

# Set the environment variable
ENV MONGODB_URL=mongodb://satya:satya123@mongodb:27017

CMD ["npm", "start"]
