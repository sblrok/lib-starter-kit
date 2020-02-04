#!/usr/bin/env bash
mkdir -p ${DIST:-build} && \
cp package.json ${DIST:-build}/ && \
cp package-lock.json ${DIST:-build}/ && \
cp README.md ${DIST:-build}/ && \
# cp {package.json,package-lock.json,README.md} ${DIST:-build}/ && \
# npx babel src --out-dir ${DIST:-build} --source-maps inline --copy-files ${BUILD_PARAMS}
../../node_modules/@babel/cli/bin/babel.js src --out-dir ${DIST:-build} --source-maps both --extensions '.js,.jsx,.ts,.tsx' ${BUILD_PARAMS:--copy-files} && \
echo "OK package-build"
#  --minified
# npx babel src --out-dir ${DIST:-build} --source-maps --minified --comments false --copy-files  ${BUILD_PARAMS}
