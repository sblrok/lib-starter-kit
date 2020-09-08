#!/usr/bin/env bash
set -o allexport
source .env
set +o allexport
node scripts/dns.js