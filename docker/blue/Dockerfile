FROM node:18-alpine

WORKDIR /app

# Set deployment color environment variable
ENV DEPLOYMENT_COLOR=blue

# Copy package files and install dependencies
COPY app/package*.json ./
RUN npm install --production

# Copy application files
COPY app/ ./

# Expose the port
EXPOSE 3000

# Set version environment variable
ENV VERSION=v1.0.0

# Command to run the application
CMD ["node", "server.js"]