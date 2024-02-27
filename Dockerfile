FROM node:16-alpine
# Set the working directory
WORKDIR /app

# install dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
