# Automating Labspace Deployment

Recognizing a deployed Labspace is simply a published Compose file, it's fairly easy to do so in CI.

## Using GitHub Actions

Before publishing using GitHub Actions, you will need to do the following:

- Setup a `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secret in GHA

The following workflow definition will publish to Hub using the `.labspace/compose.override.yaml` file. You will need to swap out the `YOUR-HUB-REPO-NAME-HERE` with the name of your Docker Hub repo.

```yaml
name: Publish Labspace

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Ensure Compose v2.39.3+ is available (includes bug fixes for publishing)
      # Can remove this action once default runners include it
      - name: Set up Docker Compose
        uses: docker/setup-compose-action@v1
        with:
          version: v2.39.3

      - name: Log in to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Publish Compose file
        run: |
          docker compose -f oci://dockersamples/labspace -f .labspace/compose.override.yaml publish $DOCKERHUB_USERNAME/YOUR-HUB-REPO-NAME-HERE --with-env -y
        env:
          DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}

```