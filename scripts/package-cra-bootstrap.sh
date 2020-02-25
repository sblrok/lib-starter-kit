#!/usr/bin/env bash
cd cra && \
../../../node_modules/npm-check-updates/bin/ncu --dep=prod,dev,peer,optional && \
npm i && \
cd ../