FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend (atau jalankan dev server)
# Karena ini environment test, kita pakai dev mode agar mudah didebug
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
