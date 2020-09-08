#!/usr/bin/env bash
if [[ -d ./.env ]]
then
  set -o allexport
  source .env
  set +o allexport
fi
lerna exec -- npm run dev