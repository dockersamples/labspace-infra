#!/bin/sh

if [ -z "$LABSPACE_COMPOSE_FILE" ] && [ -z "$LABSPACE_CONTENT_REPO" ]; then
  echo "Error: LABSPACE_CONTENT_REPO must be set if LABSPACE_COMPOSE_FILE is not specified."
  exit 1
fi

if [ -z "$LABSPACE_COMPOSE_FILE" ]; then
    LABSPACE_COMPOSE_FILE="oci://dockersamples/labspace:latest"
fi

if [ ! -f /run/secrets/docker/config.json ]; then
    echo "Warning: /run/secrets/docker/config.json not found. This container may not have been started with --use-api-socket. Docker Hub pull rate limits may apply."
fi

if [ ! -S /var/run/docker.sock ]; then
    echo "Error: /var/run/docker.sock not found. Docker is not available."
    exit 1
fi

CONTENT_REPO_URL=$LABSPACE_CONTENT_REPO docker compose -p labspace -f $LABSPACE_COMPOSE_FILE up -d -y
