#!/bin/sh

echo "Starting port forwarder..."

# Monitor Docker events for container start/stop with published ports
docker events --filter event=start --filter event=die --format "{{.Status}} {{.ID}} {{.Actor.Attributes.name}}" | while read event
do
    echo "Event: $event"
    # Add port forwarding logic here
    # This is a simplified version - the full implementation would
    # parse container port mappings and start/stop socat processes
done
