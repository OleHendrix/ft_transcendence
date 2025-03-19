cd backend
rm -rf node_modules package-lock.json
npm cache clean
npm install

npx prisma generate

cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean
npm install

cd ..
rm -rf node_modules package-lock.json
npm cache clean
npm install

npm run dev