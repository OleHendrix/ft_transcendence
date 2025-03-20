cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

npx prisma migrate dev --name init
npx prisma generate

cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

cd ..
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

npm run dev