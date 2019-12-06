#!/bin/sh
lerna exec -- npm run bootstrap && \
cd packages/app/cra && npm i && cd ../../..
# lerna exec -- npm run bootstrap