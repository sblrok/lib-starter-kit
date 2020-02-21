
if [[ -d ./cra ]]
then
  sh ../../scripts/package-cra-dev.sh
else
  npm run watch
fi