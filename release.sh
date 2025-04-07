#!/bin/bash

# Load environment variables from .env file
# Assuming .env file is in the same directory as this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source "${DIR}/.env"

# update package version to todays date
npm run update-version

npm run build:prod

npm run sentry-inject

npm run sentry-upload

# remove .map files from dist folder
rm -rf dist/*.map

npm run release

# git log -n 100 --pretty=format:"%h %ad %s" --date=short > commits.txt
# git log -n 300 --pretty=format:"%h %ad %s | %b" --date=short > commits.txt
# git log -n 300 --pretty=format:"%h %ad %s | %b" --date=short | tr '\n' ' ' | sed 's/  /\n/g' > commits.txt


