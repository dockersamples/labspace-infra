#!/bin/bash

#########################################################################
# This script is invoked by the configurator to get additional details
# about the current user. We use both the Docker Desktop UUID and the
# Hub identifier to identify the current user, but respect the current
# analytics settings within Docker Desktop. 
#
# This script simply retrieves all of those details to pass along to 
# the downstream Labspace services.
#########################################################################

if [ ! -S /backend.sock ]; then
  echo "⚠️ Backend socket not found, cannot retrieve Docker Desktop configuration"
  exit 1
fi

DD_UUID=$(curl --silent --unix-socket /backend.sock http://backend/uuid | jq -r . 2>/dev/null || echo "")
HUB_UUID=$(curl --silent --unix-socket /backend.sock http://backend/registry/info | jq -r '.uuid' 2>/dev/null || echo "")
ANALYTICS_ENABLED=$(curl --silent --unix-socket /backend.sock http://backend/app/settings | jq -r '.desktop.analyticsEnabled.value' 2>/dev/null || echo "")

jq -nc \
    --arg dd "$DD_UUID" \
    --arg hub "$HUB_UUID" \
    --arg analytics "$ANALYTICS_ENABLED" \
    '{
        uuids: {
            dd: ($dd | select(length > 0) // null),
            hub: ($hub | select(length > 0) // null)
        },
        analytics_enabled: (
            if ($analytics | length) > 0
            then (try ($analytics | fromjson) catch $analytics)
            else null
            end
        )
    }'
