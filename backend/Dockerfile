FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apt-get update && apt-get install -y openssl

COPY . .

RUN npx prisma migrate dev --name init; npx prisma generate; npx prisma db seed

RUN npm run build

EXPOSE 5001

CMD ["npm", "run", "dev"]
