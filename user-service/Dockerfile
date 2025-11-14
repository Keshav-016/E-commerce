FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (this will install Linux binaries)
RUN npm install

# Copy source code (excluding node_modules)
COPY . .

# Generate Prisma Client for the correct platform
RUN npx prisma generate

# Expose port
EXPOSE 5500

# Start the application
# CMD ["npm", "run" , "dev"]
CMD [ "sh", "-c", "npx prisma db push && npm run dev" ]
