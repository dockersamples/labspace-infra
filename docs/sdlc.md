# SDLC Labspace Variant

The SDLC (Software Development Lifecycle) Labspace variant extends the standard Labspace with a complete development and deployment pipeline. It provides a "SDLC-in-a-box" environment ideal for end-to-end development labs that demonstrate real-world workflows.

## Variant components

This variant adds four major components to the standard Labspace:

1. **Traefik Reverse Proxy** - Routes HTTP/HTTPS traffic with automatic service discovery
2. **Gitea Server** - Self-hosted Git service with package registry and CI/CD
3. **Gitea Runner** - a CI runner that automatically registeres with Gitea for executing CI/CD pipelines
4. **k3s Kubernetes Cluster** - Lightweight Kubernetes for deployment targets

### What's NOT included

While this overlay will automatically create a git repo and populate it using the Labspace content, it will not automatically deploy any applications.

However, if you have a Gitea workflow (normally in `.gitea/workflows`), it will automatically run when the initial commit is pushed.

Therefore, if you want an app to be up and running, define your own workflow to build an image and deploy it using the pre-configured secrets (example below).

## Using the variant

The variant is published in the sample `dockersamples/labspace` repository, but with a `-sdlc` suffix on the tag. Notably, you do NOT need to include the base labspace Compose file, as the SDLC variant is published with the main components (it's currently impossible to publish only an overlay file).

Tag versions:

- If you want to use the `:latest` version, use `:latest-sdlc`
- If you want to pin to a specific Labspace version (such as `:v0.21.0`), use `:v0.21.0-sdlc`

In your GitHub Action workflow (assuming you're using the `dockersamples/publish-labspace-action` action), add the additional `labspace_base_version` parameter:

```yaml
jobs:
  build-and-push:
    steps:
      ...
      - name: Publish Labspace
        uses: dockersamples/publish-labspace-action@v1
        with:
          labspace_base_version: latest-sdlc
          target_repo: ${{ env.DOCKERHUB_REPO }}
```

## Network Architecture

All services communicate via internal DNS using the `.dockerlabs.xyz` domain (which resolves everything locally):

| Service | Internal URL | External Port | Purpose |
|---------|-------------|---------------|---------|
| Gitea | `http://git.dockerlabs.xyz` | 80, 443 | Git hosting, web UI, container registry |
| Gitea SSH | `git.dockerlabs.xyz:22` | 22 | Git SSH operations |
| Zot | `registry.dockerlabs.xyz | 80, 443 | Container registry |
| k3s API | `https://k8s.dockerlabs.xyz:6443` | - | Kubernetes API server |
| k8s Apps | `http://app.dockerlabs.xyz` | 80, 443 | Applications deployed to k8s (routed via Traefik) |
| Traefik Dashboard | `http://localhost:8080` | 8080 | Traefik web UI |

## Default Credentials

The environment is pre-configured with a demo user and repository:

| Service | Username | Password | Additional Info |
|---------|----------|----------|-----------------|
| Gitea | `moby` | `moby1234` | Admin account, auto-created |
| Zot | - | - | No credentials required |

**Default Repository**: `moby/demo-app`
- Automatically created at startup
- Labspace project content is committed to this repo during workspace initialization
- Pre-configured with CI/CD secrets

### CI/CD Secrets

The following secrets are automatically configured in the `moby/demo-app` repository and available to Gitea Actions workflows:

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `DOCKER_USERNAME` | `moby` | Authenticate to container registry (not required) |
| `DOCKER_PASSWORD` | `moby1234` | Authenticate to container registry (not required) |
| `DOCKER_REGISTRY` | `registry.dockerlabs.xyz` | Registry URL for image push |
| `DOCKERHUB_USERNAME` | (from Docker Desktop) | Authenticate to Docker Hub |
| `DOCKERHUB_PASSWORD` | (from Docker Desktop) | Authenticate to Docker Hub |
| `KUBECONFIG` | (generated) | Deploy to k3s cluster |

## Automatic Setup

### Workspace Configuration

When the workspace starts, several setup scripts run automatically:

**Git Configuration**:
- Creates SSH keypair for the `moby` user
- Configures git client with `moby@local` identity
- Initializes the Labspace project as a git repository
- Commits and pushes the labspace project to `git@git.dockerlabs.xyz:moby/demo-app.git`

**Kubernetes Setup**:
- Installs `kubectl` CLI (aliased as `k`) in the workspace
- Configures kubeconfig at `~/.kube/config` in the workspace
- Adds `KUBECONFIG` secret to Gitea for CI/CD use

**Docker Hub Credentials**:
- Extracts Docker Hub credentials from the currently logged in user (provided in the workspace at `~/.docker/config.json`)
- Creates `DOCKERHUB_USERNAME` and `DOCKERHUB_PASSWORD` secrets in Gitea
- Enables CI pipelines to push to Gitea or pull images from DHI.io/Docker Hub

### Gitea Bootstrap

The Gitea service runs a comprehensive bootstrap process:

1. Creates the `moby` admin user (if not exists)
2. Creates the `moby/demo-app` repository (if not exists)
3. Generates SSH keypair and adds public key to `moby` user
4. Creates CI/CD secrets for the Gitea registry (which the registry doesn't require):
   - `DOCKER_USERNAME`: `moby`
   - `DOCKER_PASSWORD`: `moby1234`
   - `DOCKER_REGISTRY`: `registry.dockerlabs.xyz`
5. Generates runner registration token for CI/CD

### k3s Configuration

The Kubernetes cluster is configured with:
- TLS SAN for `k8s.dockerlabs.xyz` hostname
- Registry credentials for pulling from the container registry (`registry.dockerlabs.xyz`)
- Insecure TLS verification for the container registry
- Ingress routing via Traefik for `app.dockerlabs.xyz` subdomain

## Socket Proxy Configuration

The Docker socket proxy is configured with additional mount allowlist entries to support the SDLC components:

- `buildx_buildkit_builder-*` - For named BuildKit builders
- `act-toolcache` - For Gitea Actions runner cache
- `GITEA*` - For Gitea-related volumes

This allows CI/CD jobs to build images using Docker buildx.

## Service Dependencies

The workspace service depends on:
- Gitea (`git`) - Must be healthy before workspace starts
- k3s (`k3s`) - Must be healthy before workspace starts

This ensures all infrastructure is ready before users can interact with the environment.

## Example: Creating a CI/CD Workflow

Create `.gitea/workflows/build-and-deploy.yaml` in your Labspace content:

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.timestamp.outputs.tag }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

        # This config is only needed in this demo environment due to self-signed certs
        with:
          config-inline: |
            [registry."registry.dockerlabs.xyz"]
              http = true

      - name: Log in to container registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Generate timestamp tag
        id: timestamp
        run: echo "tag=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_USERNAME }}/demo-app:${{ steps.timestamp.outputs.tag }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Update Kubernetes manifests
        run: |
          sed -i "s|moby/demo-app:latest|moby/demo-app:${{ needs.build-and-push.outputs.image-tag }}|g" k8s/app.yaml

      - name: Setup kubectl
        uses: azure/setup-kubectl@v4

      - name: Set kubectl context
        uses: azure/k8s-set-context@v4
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v5
        with:
          manifests: |
            k8s/app.yaml
          timeout: 30s
```

A sample `k8s/app.yaml` is below that will connect `app.dockerlabs.xyz` to the Labspace application running on its containerized port 3000:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: app
  ports:
    - port: 3000
---  
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
spec:
  ingressClassName: traefik
  rules:
    - host: app.dockerlabs.xyz
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: app
              port:
                number: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - image: registry.dockerlabs.xyz/moby/demo-app:latest
          name: application
          ports:
            - containerPort: 3000
              protocol: TCP
```

## Accessing Services

From the workspace terminal:

```bash
# Commit and push files (auth is already pre-configured)
git add .
git commit -m "Some changes"
git push

# Interact with Kubernetes resources (auth is pre-configured)
kubectl get pods

# Use the alias `k` for kubectl as well
k describe pod
```

From the user's browser:
- Gitea UI: http://git.dockerlabs.xyz (routed via Traefik)
- Container registry: http://registry.dockerlabs.xyz
- Deployed apps: http://app.dockerlabs.xyz
- Traefik dashboard: http://localhost:8080

## Security Considerations

This environment is designed for educational/demo purposes:

- All credentials are hardcoded and publicly documented
- TLS verification is disabled for the Gitea registry
- The Traefik API is exposed without authentication
- The container registry does not require authentication to push or pull images
- k3s uses a static token

**Do not use these configurations in production environments.**