# Dockerfile for CyberAudit 360 Express Backend
# Experiment 7: Containerize Backend using Node.js runtime

FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install dependencies using clean reproducible install
RUN npm ci

# Copy backend application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Start Express server
CMD ["npm", "start"]
