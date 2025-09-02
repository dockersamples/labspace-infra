# Launcher

This component is intended to serve as a intermediate service to launch a Labspace in settings where configuration can't be specified, such as Docker Desktop extensions.

This component will simply set the required environment variables and launch the Labspace Compose stack using the mounted Docker socket.

This container should be launched using the `--use-api-socket` flag to ensure registry credentials are injected, allowing images to be pulled with credentials to prevent escape rate-limiting and to work in environments where Enforced Log-in is configured.



## Configuration

The following configuration options can be specified:

| Variable              | Description                                               | Required | Default value |
|-----------------------|-----------------------------------------------------------|----------|--------------|
| LABSPACE_CONTENT_REPO | Path to the Labspace configuration file | Yes, unless LABSPACE_COMPOSE is specified | N/A |
| LABSPACE_COMPOSE_FILE | File to be used for the Compose stack | No | oci://dockersamples/labspace:latest |
