# Use official Node.js image
FROM node:18

# Create working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source code
COPY . .

# Set default environment variables (override in runtime)
ENV PORT=8080
ENV NODE_ENV=production

# Expose the port your server runs on
EXPOSE 8080

# Start the backend app
CMD ["npm", "start"]
