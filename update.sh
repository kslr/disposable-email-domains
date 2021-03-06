#!/usr/bin/env bash
git pull -q -f

node sync.js

if [[ "$(git status --porcelain)" ]]; then
    git commit -a -m $(date +"%m-%d-%Y")
    git push origin master
fi
