# Dockerfile for CyberAudit 360 Express Backend
# Experiment 9: Containerizing Backend with Node.js Alpine runtime

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend application source code
COPY . .

# Expose backend API and Socket.IO port
EXPOSE 5000

# Start Express server
CMD ["npm", "start"]
