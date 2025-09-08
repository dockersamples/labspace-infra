# Labspace configuration

There are a variety of reasons you may need to adjust the defaults in a Labspace. Ideas might include:

- Using a different image/environment for the workspace
- Specifying different ports for the workspace to expose
- Adding additional environment variables for the workspace
- Adding models to the Labspace

> [!IMPORTANT]
> Since all of the configuration is defined using Compose, it is important to understand how [Compose files are merged](https://docs.docker.com/reference/compose-file/merge/), including options to replace and reset values.



## Important note

Beyond the project clone URL, **only the workspace service should be modified.** Adjustments to any other services may impact the Labspace's environment and configuration, potentially causing issues or unreliability.



## Configuration examples

The following examples are configurations of the `.labspace/compose.override.yaml` file used to publish the Labspace.

### Required configuration

The only required configuration is to specify the source of the Labspace content:

```yaml
services:
  configurator:
    environment:
      PROJECT_CLONE_URL: https://github.com/example/labspace-demo
```

## Override example

The following configuration will change the workspace's image, exposed ports, and add a model to the stack and the workspace container.

```yaml
services:
  configurator:
    environment:
      PROJECT_CLONE_URL: https://github.com/example/labspace-demo

  workspace:
    image: dockersamples/labspace-workspace-java
    models:
      gemma3:
        model_var: OPENAI_MODEL
        endpoint_var: OPENAI_BASE_URL
    ports: !override
      - 8080:8080
      - 8085:8085

models:
  gemma3:
    model: ai/gemma3:4B-F16
```



## Seeing the default values

The default values for the Labspaces can be seen in the Compose files at the root of the repo:

- [`compose.run.yaml`](../compose.run.yaml) - this Compose file is the "main" Compose file when launching a Labspace - `oci://dockersamples/labspace`
- [`compose.content-dev.yaml`](../compose.content-dev.yaml) - this Compose file is the one used for content development - `oci://dockersamples/labspace-content-dev`

To access the defaults, swap in the desired OCI artifact into the `docker compose config` command below:

```console
docker compose config oci://dockersamples/labspace
```



## Configuration options

The following overrides are common options:



### Overriding the workspace image

To override the workspace image, simply specify a new image for the `workspace` service.

This project currently provides the following images:

- `dockersamples/labspace-workspace-node` - [Docker Hub](https://hub.docker.com/r/dockersamples/labspace-workspace-node) | [Dockerfile](../components/workspace/node/Dockerfile) - a Node-based environment
- `dockersamples/labspace-workspace-java` - [Docker Hub](https://hub.docker.com/r/dockersamples/labspace-workspace-java) | [Dockerfile](../components/workspace/java/Dockerfile) - a Java-based environment with a JDK and Maven

If you need to create your own environment, it is recommended to begin with the `dockersamples/labspace-workspace-base` image. This image includes the Docker tooling, extensions, and default VS Code configuration.

```yaml
services:
  workspace:
    image: my-custom-image
```


### Overriding the workspace ports

Note that you only need to change ports when you want to run an app _from inside_ the workspace container. Any launched containers (either through Compose or directly in the CLI) don't also need to be exposed on the workspace container.

Scenarios:

- A Labspace that instructs users to run `npm run dev` that runs a Node app on port 3000
    - In this example, port 3000 would need to be exposed by the workspace container to allow the browser to open the app
- A Labspace that instructs users to run a Spring Boot app that runs on port 8080
    - The workspace would need to publish port 8080 to be accessible by the browser
- A Labspace that instructs users to start a nginx container and publish port 80
    - This would _not_ require any port changes on the workspace, as the nginx container is publishing its own port

```yaml
services:
  workspace:
    ports: !override
      - "6274:6274" # MCP Inspector users will launch from inside the Labspace
      - "8080:8080"
```

