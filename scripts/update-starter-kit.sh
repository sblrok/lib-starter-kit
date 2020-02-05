#!/usr/bin/env bash
HOME='.'
git pull ../lib-starter-kit
rsync -avEp --progress  ../lib-starter-kit/ $HOME --exclude='*/' --exclude='lerna.json' --exclude='.huskyrc.json' --exclude='README.md' --exclude='CHANGELOGz.md'
rsync -avEp --progress  ../lib-starter-kit/.storybook $HOME
rsync -avEp --progress  ../lib-starter-kit/scripts/* $HOME/scripts

echo "\n\n\nYou need:\nnpm install && npm run bootstrap && npm run update"
