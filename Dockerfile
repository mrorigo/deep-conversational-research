# Use a Node.js base image
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the TypeScript source code
COPY . .

# Compile the TypeScript code
RUN npm install -g typescript && tsc

# Use a Node.js base image
FROM node:20-alpine

# Update the package list and install bash
RUN apk update && apk add bash

# Set the working directory
WORKDIR /app

# Copy the built code from the builder stage
COPY --from=builder /app/dist ./

# Copy package.json for production dependencies
COPY package.json ./

# Install only production dependencies
RUN npm install --production

# Expose a port (if your application needs it)
# EXPOSE 3000

# Modify entrypoint to accept arguments from ENV
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["-h"] #Default argument (can be overridden)
