FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install the 'tzdata' package
RUN apk --no-cache add tzdata

# Set the timezone to Asia/Kolkata
ENV TZ Asia/Kolkata

# Set the locale to en_US.UTF-8 for a 12-hour time format
ENV LANG en_US.UTF-8
ENV LC_TIME en_US.UTF-8

ENV MONGODB_URL=$MONGODB_URL
ENV PORT=$PORT

# install dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
