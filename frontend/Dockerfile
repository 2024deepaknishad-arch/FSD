# Dockerfile for CyberAudit 360 React Frontend
# Experiment 9: Containerizing Full-Stack App with Docker Compose (Vite Development Server)

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for optimal layer caching
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Start Vite dev server binding to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
