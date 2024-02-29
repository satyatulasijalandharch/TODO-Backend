FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install the 'tzdata' package
RUN apk --no-cache add tzdata

# Set the timezone to Asia/Kolkata
ENV TZ Asia/Kolkata

# install dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
