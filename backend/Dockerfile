# Use an official Node.js runtime as a parent image
FROM node:25-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY tsconfig.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 3000

# Define the command to run your app
CMD [ "node", "dist/server.js" ]
