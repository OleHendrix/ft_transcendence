FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apt-get update && apt-get install -y openssl

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5001

CMD npx prisma migrate deploy && npm run dev
