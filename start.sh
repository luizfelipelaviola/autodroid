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
git pull
git fetch --all --tags --prune -f
git checkout tags/wrseg23 -f
git pull -f

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
