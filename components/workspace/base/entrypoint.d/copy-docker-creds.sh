#!/bin/bash

set -e

if [ -f /docker-creds/config.json ]; then
    if [ -f /home/coder/.docker/config.json ]; then
        echo "Docker credentials already configured in workspace. Skipping copy."
    else
        echo "Setting up Docker credentials in workspace..."
        mkdir -p /home/coder/.docker
        cp /docker-creds/config.json /home/coder/.docker/config.json
        echo "Docker credentials copied successfully."
        chown -R coder:coder /home/coder/.docker
    fi
else
    echo "No Docker credentials found to copy."
fi