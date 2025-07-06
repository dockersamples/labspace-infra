#!/bin/bash

set -e

if [ -z "$PROJECT_CLONE_URL" ]; then
  echo "Error: PROJECT_CLONE_URL environment variable is not set."
  exit 1
fi

if [ -d "/project/.git" ]; then
  echo "Project already cloned. Exiting."
  exit 0
fi

git config --global user.email "demo@example.com"
git config --global user.name "Docker Workshop"
git config --global --add safe.directory /project

cd /project

# Remove everything including hidden files (like the .git directory)
ls -A1 | xargs rm -rf

git clone $PROJECT_CLONE_URL .

if [ -f "./setup.sh" ]; then
  bash ./setup.sh
fi

if [ -n "$SETUP_SCRIPT" ]; then
  if [ -f "$SETUP_SCRIPT" ]; then
    bash "$SETUP_SCRIPT"
  else
    echo "Warning: SETUP_SCRIPT defined ('$SETUP_SCRIPT'), but not found."
  fi
fi

chown 1000:1000 -R /project