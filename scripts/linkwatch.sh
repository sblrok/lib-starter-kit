#!/usr/bin/env bash

# https://github.com/watchexec/watchexec
# `brew install watchexec`

echo "linking $1 => $2"
watchexec -r \
  -w $1 \
  --signal SIGTERM \
  -- \
    rsync -avEp --progress \
      --exclude node_modules \
      $1/ \
      $2
