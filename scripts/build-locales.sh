#!/usr/bin/env bash

# export I18_LINK="${node -e \"console.log(require('./.env.js').i18.url)\"}"
LOCALES_LINK=`node -e "console.log(require('./.env.js').i18.url)"`
LOCALES_DIST="./packages/app/i18"

# export I18_LINK="${node -e 'console.log(123)'}"
# echo $I18_LINK
echo "$LOCALES_LINK => $LOCALES_DIST"

rm -rf $LOCALES_DIST && \
node node_modules/@lskjs/build-locales/bin/build-locales --locales ru,en --link $LOCALES_LINK --dist $LOCALES_DIST && \
echo "done"
# cp packages/app/locales/ru.json packages/app/locales/ru/translation.json && \
# cp packages/app/locales/en.json packages/app/locales/en/translation.json && \
# rm -rf packages/app/public/locales && \
# cp -R packages/app/locales packages/app/public/locales
# npx @lskjs/build-locales --locales ru,en --link https://docs.google.com/spreadsheets/d/1_qVnTw1Cwb2Ziwta_N0p-V4_ptD6-ZypDvCIrnryNF/edit#gid=0 --dist ./locales