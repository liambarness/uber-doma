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

EXPOSE 3001

# Define environment variables (can be overridden)
ENV PORT=3001

# Run server.js when the container launches
CMD [ "node", "server.js" ]