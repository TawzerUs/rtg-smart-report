# Use a lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and server file
COPY dist ./dist
COPY server.js .

# Expose the port Cloud Run will set (default 8080)
EXPOSE 8080

# Start the Express server
CMD ["node", "server.js"]
