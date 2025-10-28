#!/bin/bash

set -e

if [ -f /docker-creds/config.json ]; then
    echo "Copying Docker credentials..."
    mkdir -p /home/coder/.docker
    cp /docker-creds/config.json /home/coder/.docker/config.json
    echo "Docker credentials copied successfully."
    chown -R coder:coder /home/coder/.docker
else
    echo "No Docker credentials found to copy."
fi