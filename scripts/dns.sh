#!/usr/bin/env bash
if [[ -f ./.env ]]
then
  set -o allexport
  source .env
  set +o allexport
fi
node scripts/dns.js