FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client for the correct platform
RUN npx prisma generate

# Start the application

CMD [ "sh", "-c", "npx prisma db push && npm run dev" ]
