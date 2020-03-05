#!/usr/bin/env bash
rm -rf cra/build && \
rm -rf cra/src && \
pwd && \
ls -la && \
cd cra && \
pwd && \
ls -la && \
ln -s ../build src && \
ls -la src && \
CI=false SKIP_PREFLIGHT_CHECK=true npm run build && \
echo "OK - cra build" && \
# npm run server
cd .. && \
rm -rf public && \
cp -R cra/build public && \
node ../../scripts/package-cra-build-extract.js && \
cd .. && \
#npm run dev:cra"
echo "DONE"


