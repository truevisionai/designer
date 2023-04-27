#!/bin/bash

# Load environment variables from .env file
. /.env

# update package version to todays date
npm run update-version

npm run build:prod

npm run sentry-inject

npm run sentry-upload

npm run release
