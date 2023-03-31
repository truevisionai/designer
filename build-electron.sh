#!/bin/bash

platform=$1

if [ "$platform" == "ubuntu-latest" ]; then
  npx electron-builder build --linux --publish always
elif [ "$platform" == "macOS-latest" ]; then
  npx electron-builder build --mac --publish always
elif [ "$platform" == "windows-latest" ]; then
  npx electron-builder build --win --publish always
else
  echo "Invalid platform"
  exit 1
fi
