cd backend
rm -rf node_modules package-lock.json
npm cache clean --force

cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean --force

cd ..
rm -rf node_modules package-lock.json
npm cache clean --force
