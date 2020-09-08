#!/usr/bin/env bash

LOCALES_LINK=`node -e "console.log(require('./.lskjs.js').i18.url)"`
LOCALES_DIST="./i18"

echo "$LOCALES_LINK => $LOCALES_DIST"

rm -rf $LOCALES_DIST && \
node ../../node_modules/@lskjs/build-locales/bin/build-locales --locales ru,en --link $LOCALES_LINK --dist $LOCALES_DIST && \
echo "done"