#!/bin/bash

if ! [ -x "$(command -v docker)" ]; then
  echo "Error: docker is not installed."
  exit 1
fi

if ! [ -x "$(command -v git)" ]; then
  echo "Error: git is not installed."
  exit 1
fi

git checkout master -f
git pull -f
git fetch --all --tags --prune --force
git checkout tags/wrseg23 -f

if docker compose --version &> /dev/null; then
  docker compose pull
  docker compose up
  docker compose down
elif command -v docker-compose &> /dev/null; then
  docker-compose pull
  docker-compose up
  docker-compose down
else
  echo "Error: docker compose is not installed."
  exit 1
fi
