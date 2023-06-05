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

npm run release
