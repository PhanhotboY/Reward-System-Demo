# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /home/node/reward-system-demo

# Copy package.json and package-lock.json to the working directory
COPY ["package*.json", "yarn.lock", "./"]

# Install dependencies
RUN yarn

# Copy the rest of the application code to the working directory
COPY . .

# Deploy the smart contracts
RUN yarn hardhat deploy --network localhost

# Expose the port on which your web server will listen
EXPOSE 3000

# Specify the command to start your web server
CMD [ "yarn", "start" ]
