# Use Node.js base image
FROM node:18

# Create working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source code
COPY . .

# Build the frontend
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the frontend server
CMD ["npm", "start"]
