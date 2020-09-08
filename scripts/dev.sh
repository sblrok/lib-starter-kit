#!/usr/bin/env bash
set -o allexport
source .env
set +o allexport
lerna exec -- npm run dev