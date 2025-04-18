# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install
# If you use yarn:
# RUN yarn install

# Bundle app source
COPY . .

# Make port 3001 available to the world outside this container (adjust port per service)
# For request-ride-service: 3001
# For rider-gateway: 8080
# For process-payment-service: 3002
# For payments-gateway: 8081
# For assign-driver-service: 3003
# For driver-gateway: 8082
EXPOSE 3002

# Define environment variables (can be overridden)
ENV PORT=3002

# Run server.js when the container launches
CMD [ "node", "server.js" ]