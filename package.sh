yarn build
rm -rf package
mkdir package
mv dist package/
cp package.json package/
cp README.md package/
cp yarn.lock package/
cp LICENSE package/
cd package
npm publish
cd ..