cd ../xmen-landing
npm run build
rm -rf ../kit/packages/app/public/template.html
cp -R build/* ../kit/packages/app/public/
mv ../kit/packages/app/public/index.html ../kit/packages/app/public/template.html