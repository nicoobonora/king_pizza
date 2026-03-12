FROM node:20-alpine

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Seed database if it doesn't exist
RUN node db/seed.js || true

EXPOSE 3000

CMD ["node", "server.js"]
