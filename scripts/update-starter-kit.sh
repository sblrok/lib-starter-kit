#!/usr/bin/env bash
DIRTO='.'
DIR=`pwd`

# cd ../lib-starter-kit && git pull && cd $DIR && \
# rm -rf scripts/* && \
rsync -avEp --progress  ../lib-starter-kit/ $DIRTO \
  --exclude='*/' \
  --exclude='.git' \
  --exclude='.lskjs.js' \
  --exclude='coverage' \
  --exclude='lerna.json' \
  --exclude='README.md' \
  --exclude='CHANGELOG.md'\
  --exclude='.env.js' && \
rsync -avEp --progress --ignore-existing ../lib-starter-kit/.lskjs.js $DIRTO && \
rsync -avEp --progress --ignore-existing ../lib-starter-kit/README.md $DIRTO && \
rsync -avEp --progress --ignore-existing ../lib-starter-kit/CHANGELOG.md $DIRTO && \
rsync -avEp --progress  ../lib-starter-kit/.storybook $DIRTO && \
rsync -avEp --progress  ../lib-starter-kit/scripts/* $DIRTO/scripts && \
echo "\n\n\nYou need:\nnpm install && npm run bootstrap && npm run update"
