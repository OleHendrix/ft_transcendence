cd backend
npm install

npx prisma migrate dev --name init
npx prisma generate

cd ../frontend
npm install

cd ..
npm install

npm run dev