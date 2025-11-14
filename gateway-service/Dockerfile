FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Start the application

CMD [ "sh", "-c", "npm run dev" ]
