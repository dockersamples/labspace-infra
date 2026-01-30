# CLAUDE.md

This document provides guidance for AI agents working with the labspace-infra codebase.

## Project Overview

Labspace Infra is a Docker-based infrastructure for creating interactive educational environments. A Labspace provides:
- A split-screen browser interface (markdown content on left, VS Code IDE on right)
- A fully isolated, Docker-enabled development environment
- Interactive code blocks that can be copied, run, or saved directly from the documentation

Users launch a Labspace with a single command and access it at `http://localhost:3030`.

## Architecture

The system consists of multiple coordinated Docker containers:

```
┌─────────────────────────────────────────────────────────────────┐
│  Interface (interface)                                          │
│  - Express API backend + React/Vite frontend                    │
│  - Renders markdown content, handles code execution             │
│  - Port 3030 (production) or 5173 (dev)                        │
└─────────────────────────────────────────────────────────────────┘
           │
           │ JWT-signed requests via Unix socket
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Workspace (workspace)                                          │
│  - code-server (VS Code in browser)                            │
│  - Custom labspace-support VS Code extension                    │
│  - Port 8085                                                    │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Docker commands via proxied socket
           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Socket Proxy (socket-proxy)                                    │
│  - Wraps Docker daemon with security controls                   │
│  - Labels all containers for cleanup                            │
│  - Adds containers to labspace network                          │
│  - Remaps mount paths for isolation                             │
└─────────────────────────────────────────────────────────────────┘

Supporting services:
- Configurator: Clones content repos, generates keypairs, runs init scripts
- Host Port Republisher: Forwards ports from user-created containers
- Workspace Cleaner: Removes abandoned labspace resources
```

### Key Volumes

| Volume | Purpose |
|--------|---------|
| `labspace-content` | Project/content files |
| `labspace-socket-proxy` | Proxied Docker socket |
| `labspace-support` | Security keypairs, metadata, extension socket |

## Content Loading (Configurator)

The configurator service runs once at startup and is responsible for loading content and setting up the environment. It runs as a one-shot container that must complete successfully before other services start.

### Content Sources (in priority order)

The configurator supports multiple ways to load content:

1. **DEV_MODE=true**: Content is directly mounted (no copying). Used by `compose.yaml` for infrastructure development.

2. **LOCAL_MODE=true + LOCAL_CONTENT_PATH**: Copies content from a local path. Used when content is bind-mounted.

3. **PROJECT_TAR_PATH**: Extracts content from a base64-encoded tarball. Used for OCI artifact deployments.

4. **PROJECT_CLONE_URL**: Clones content from a git repository. Used by `compose.run.yaml` for production deployments.

If `PROJECT_SUBPATH` is set, only that subdirectory is copied to `/project`.

### Init Scripts

After content is staged, the configurator looks for executable scripts in `/init-scripts/` and runs them in order. Content repos can provide these via a `.labspace/init-scripts/` directory that gets mounted.

This is useful for:
- Downloading additional dependencies
- Pre-building images
- Setting up initial project state

### Setup Sequence

```
1. setup_support_directories  → Create /etc/labspace-support/{private-key,public-key,socket,metadata}
2. setup_project_directory    → Load content via one of the methods above
   └── run_setup_script       → Execute any init scripts
3. create_keypair             → Generate EC key pair for JWT signing (if not exists)
4. copy_docker_credentials    → Copy Docker config from /run/secrets/docker/config.json
5. update_permissions         → Set ownership to coder user (UID 1000)
6. create_labspace_metadata   → Collect metadata from Docker Desktop and labspace.yaml
```

### Metadata Collection

The configurator creates `/etc/labspace-support/metadata/metadata.json` containing:
- `labspace_mode`: "standard" or "dev"
- `labspace_id`: From labspace.yaml `metadata.id`
- `source_repo`: From labspace.yaml `metadata.sourceRepo`
- `content_version`: Git commit SHA or labspace.yaml `metadata.contentVersion`
- `infra_version`: Image tag of the configurator
- `uuids.dd`: Docker Desktop UUID (for analytics, if enabled)
- `uuids.hub`: Docker Hub UUID (for analytics, if enabled)
- `analytics_enabled`: User's analytics preference from Docker Desktop

This metadata is used by the interface for analytics (respecting user opt-out).

## Host Port Republisher

The host-port-republisher enables users to access services running in containers they create from `localhost`. It runs in the same network namespace as the workspace container (`network_mode: service:workspace`).

### How It Works

1. **Startup scan**: Lists all existing containers with the `labspace-resource` label and sets up forwarding
2. **Event watching**: Subscribes to Docker events (start/die) for labeled containers
3. **Port forwarding**: When a container starts with published ports, spawns `socat` processes to forward traffic:
   ```
   socat TCP-LISTEN:{hostPort},fork,reuseaddr TCP:{containerIP}:{containerPort}
   ```
4. **Network connectivity**: Ensures the target container is on a shared network with the republisher so it can reach the container's IP
5. **Cleanup**: When containers die or the service shuts down, kills the socat processes

### Why This Is Needed

When a user runs `docker run -p 3000:3000 myapp` inside the labspace:
- The port is published on the *workspace container's* network, not the host
- Without the republisher, `localhost:3000` wouldn't reach the app
- The republisher forwards `workspace:3000` → `user-container:3000`, making the app accessible

### Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `LABEL_FILTER` | `demo=app` | Label selector for containers to watch |
| `PORT_OFFSET` | `0` | Offset to add to host ports (rarely used) |

## Workspace Cleaner

The workspace-cleaner ensures all user-created Docker resources are removed when the labspace shuts down.

### How It Works

1. **Idle loop**: Runs continuously but does nothing during normal operation
2. **Shutdown trigger**: On SIGINT/SIGTERM (when `docker compose down` runs), performs cleanup
3. **Resource removal**: Removes all resources with the configured label:
   - Stops and removes containers
   - Removes volumes
   - Removes networks

### Why This Is Needed

Users create containers, volumes, and networks during their labspace session. Without cleanup:
- Resources would persist after `docker compose down`
- Subsequent labspace sessions might conflict with old resources
- Users' Docker environments would accumulate orphaned resources

The socket proxy labels all user-created resources with `labspace-resource=true`, enabling the cleaner to find and remove exactly the right resources.

### Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `LABEL_FILTER` | `demo=app` | Label selector for resources to clean up |

## Analytics (Marlin Integration)

Labspaces collect usage analytics to help understand how educational content is being used. Marlin is Docker's in-house data warehouse where production events are sent.

### Privacy and Opt-In

Analytics are **opt-in only**. Events are only sent if:
1. The user has `analyticsEnabled: true` in their Docker Desktop settings
2. The `MARLIN_ENDPOINT` and `MARLIN_API_KEY` environment variables are configured

The configurator retrieves the user's analytics preference from Docker Desktop during setup and stores it in the metadata. The analytics publisher checks this flag before sending any events.

### Events Tracked

| Event Type | Action | When Fired |
|------------|--------|------------|
| `lifecycle` | `start` | Labspace starts up |
| `lifecycle` | `stop` | Labspace shuts down (includes session duration, sections visited) |
| `user_action` | `section_change` | User navigates to a different section |
| `user_action` | `copy` | User clicks "Copy" on a code block |
| `user_action` | `run` | User clicks "Run" on a code block |
| `user_action` | `save` | User clicks "Save" on a code block |

### Event Properties

All events include:
- `labspace_id`: From labspace.yaml metadata
- `labspace_source_repo`: Repository URL
- `labspace_content_version`: Git SHA or version from metadata
- `labspace_mode`: "standard" or "dev"
- `labspace_infra_version`: Image tag
- `hub_user_uuid`: Docker Hub user ID (if available)
- `desktop_instance_uuid`: Docker Desktop UUID (if available)

### Development: Marlin Mock

During local development, the `marlin-mock` service provides a fake Marlin endpoint:

- **Web UI**: http://localhost:3030 - View received events with formatted JSON
- **API endpoints**:
  - `POST /events/v1/track` - Receive events (same as production Marlin)
  - `GET /events` - List all stored events as JSON
  - `DELETE /events` - Clear stored events
  - `GET /health` - Health check

The mock stores the last 100 events in memory and validates the API key. This allows testing analytics without sending data to production.

### Configuration

| Variable | Used In | Purpose |
|----------|---------|---------|
| `MARLIN_ENDPOINT` | interface | URL to send events (production Marlin or mock) |
| `MARLIN_API_KEY` | interface, marlin-mock | API key for authentication |

In `compose.yaml` (dev), these point to the marlin-mock service. In production, they would point to Docker's Marlin infrastructure.

## Security Model (Socket Proxy)

The socket proxy is critical for:
1. **Isolation**: Only labspace-labeled resources are visible
2. **Networking**: All containers join the `labspace` network for DNS resolution
3. **Cleanup**: Labels enable the workspace-cleaner to remove abandoned resources
4. **Mount security**: Path remapping prevents access outside allowed directories

## Development Workflow

### Infrastructure Development (modifying this repo)

```bash
docker compose up --watch --build
```

- Access at http://localhost:5173 (Vite dev server)
- Hot-reload enabled via Compose Watch
- Uses `sample-content-repo/` as test content

### Content Development (creating labspace content)

```bash
CONTENT_PATH=./your-content docker compose -f compose.content-dev.yaml up
```

- Access at http://localhost:3030
- Bind-mounts your content for live editing

### Running a Published Labspace

```bash
docker compose -f oci://dockersamples/labspace:latest up
```

Or with a specific content repo:
```bash
CONTENT_REPO_URL=https://github.com/user/repo docker compose -f compose.run.yaml up
```

## SDLC Labspace Variant

The SDLC (Software Development Lifecycle) variant extends the standard Labspace with a complete development and deployment pipeline, providing a "SDLC-in-a-box" environment. This variant is defined in `compose.sdlc.yaml`.

**Additional Services:**
- **Traefik**: Reverse proxy for HTTP/HTTPS routing with automatic service discovery
- **Gitea**: Self-hosted Git server with package registry and CI/CD (Gitea Actions)
- **Gitea Runner**: Act runner for executing CI/CD pipelines
- **k3s**: Lightweight Kubernetes cluster for deployment targets

**Key Features:**
- Runs each service on a different domain name (git.dockerlabs.xyz, k8s.dockerlabs.xyz, app.dockerlabs.xyz)
- Gitea has a pre-configured user: `moby` / `moby1234` with admin access
- Default repository: `moby/demo-app` (automatically created and populated with Labspace content)
- Automatic workspace setup: git configuration, SSH keys, kubectl CLI, Docker Hub credentials
- CI/CD secrets pre-configured for both Gitea registry and Docker Hub
- Kubernetes deployments accessible via Traefik at `app.dockerlabs.xyz`
  - Labspaces need to actually define the workflows and k8s manifests to deploy

**Use Cases:**
- End-to-end development workflows (code → commit → CI → deploy)
- Container registry workflows (build → push → pull → deploy)
- Kubernetes deployment demonstrations
- CI/CD pipeline development and testing

**Socket Proxy Extensions:**
The SDLC variant extends the socket proxy mount allowlist to support:
- BuildKit builders (`buildx_buildkit_*`)
- Gitea Actions runner cache (`act-toolcache`)
- Gitea volumes (`GITEA*`)

For complete documentation including service URLs, credentials, setup process, and examples, see **[docs/sdlc.md](docs/sdlc.md)**.

## Directory Structure

```
components/
├── interface/           # Main user-facing application
│   ├── api/            # Express backend (Node.js)
│   │   └── src/
│   │       ├── routes/     # API endpoints
│   │       └── services/   # Business logic
│   └── client/         # React frontend (Vite)
│       └── src/
│           └── components/  # React UI components
├── workspace/          # VS Code environments
│   ├── base/          # Base workspace with Docker tools
│   ├── node/          # Node.js preset
│   ├── java/          # Java/Maven preset
│   └── python/        # Python/Poetry preset
├── configurator/       # Setup and bootstrap
├── support-vscode-extension/  # Custom VS Code extension
├── host-port-republisher/     # Port forwarding
├── workspace-cleaner/         # Resource cleanup
└── marlin-mock/        # Analytics mock (dev only)

docs/                   # User documentation
sample-content-repo/    # Example labspace content
```

## Key Technologies

- **Frontend**: React 19, Vite, React Router, React Bootstrap, react-markdown
- **Backend**: Node.js 24, Express 5
- **Infrastructure**: Docker Compose, BuildX, OCI artifacts
- **IDE**: code-server (VS Code in browser)

## Component Communication

### Interface ↔ VS Code Extension

The interface communicates with the VS Code extension via:
1. JWT-signed tokens (RS256/ES256) for security
2. Unix socket at `/etc/labspace-support/socket/labspace.sock`

Extension endpoints:
- `POST /command` - Execute a command in terminal (requires JWT)
- `POST /save` - Save file content
- `POST /open` - Open file in editor (optionally at specific line)

### Labspace Content Format

Content is defined in `labspace.yaml`:

```yaml
metadata:
  id: my-labspace
  sourceRepo: github.com/user/repo
  contentVersion: 1.0.0

title: My Labspace
description: Description here

sections:
  - title: Section Title
    contentPath: ./01-intro.md
```

## Markdown Rendering Pipeline

The interface uses a multi-stage pipeline to parse, transform, and render markdown content.

### Backend Processing (labspace.js)

The API backend handles:

1. **Section loading**: Reads `labspace.yaml`, generates section IDs from titles
2. **Variable interpolation**: Replaces `$$varName$$` with stored values before sending to client
3. **Code block extraction**: Parses code blocks by index for command execution

```
labspace.yaml → Section config with IDs
markdown file → Variable replacement → Client
```

Key methods:
- `getLabspaceDetails()`: Returns title, description, section list
- `getSectionDetails(id)`: Returns section content with variables interpolated
- `getCodeBlock(sectionId, index)`: Extracts code, language, and metadata from a specific block

### Frontend Rendering (MarkdownRenderer.jsx)

Uses `react-markdown` with a plugin pipeline:

**Remark plugins (Markdown AST):**
| Plugin | Purpose |
|--------|---------|
| `remarkGfm` | GitHub Flavored Markdown (tables, strikethrough, etc.) |
| `remarkCodeIndexer` | Adds `data-code-index` to code blocks for Run button |
| `remarkDirective` | Parses `::directive` syntax |
| `tabDirective` | Transforms directives into React component elements |

**Rehype plugins (HTML AST):**
| Plugin | Purpose |
|--------|---------|
| `rehypeRaw` | Allows raw HTML in markdown |
| `rehypeMermaid` | Renders Mermaid diagrams |
| `rehypeGithubAlerts` | GitHub-style alert boxes (`> [!NOTE]`, etc.) |

**Custom components:**
| Component | Renders | File |
|-----------|---------|------|
| `CodeBlock` | Fenced code with syntax highlighting + buttons | `CodeBlock.jsx` |
| `ExternalLink` | Links that open in new browser tabs | `ExternalLink.jsx` |
| `RenderedImage` | Images with path resolution | `RenderedImage.jsx` |
| `TabLink` | `::tabLink` directive - opens URL in IDE tab | `TabLink.jsx` |
| `FileLink` | `:fileLink` directive - opens file in IDE | `FileLink.jsx` |
| `VariableDefinition` | `::variableDefinition` - input card for variables | `VariableDefinition.jsx` |

### Code Block Processing

The `remarkCodeIndexer` plugin:
1. Assigns each code block a sequential index (`data-code-index`)
2. Parses metadata from the code fence (e.g., `bash no-run-button save-as=file.txt`)
3. Sets data attributes: `data-display-run-button`, `data-display-copy-button`, `data-display-save-as-button`

The `CodeBlock` component reads these attributes to show/hide buttons.

### Command Execution Flow

When a user clicks "Run" on a code block:

```
1. CodeBlock.jsx → runCommand(sectionId, codeIndex)
2. WorkshopContext.jsx → POST /api/labspace/sections/:id/command { codeBlockIndex: 3 }
3. labspace.js route → vscodeService.executeCommand()
4. vscode.js → Extract code block FROM FILE, create JWT with command
5. vscode.js → POST to Unix socket /etc/labspace-support/socket/labspace.sock
6. VS Code extension → Verify JWT, execute in terminal
```

**Security: Index-Based Command Execution**

The client only sends the code block index, never the command itself:
```json
{ "codeBlockIndex": 3 }
```

The server extracts the actual command from the markdown file on disk. This is a deliberate security design:
- **Prevents arbitrary command injection**: An attacker cannot send a crafted API request to run arbitrary commands
- **Commands are content-controlled**: Only commands written in the labspace content files can be executed
- **Auditable**: The markdown files serve as the source of truth for what commands are runnable

The same pattern applies to file saves - the client sends the code block index, and the server extracts both the file path (`save-as` metadata) and content from the markdown file.

The JWT contains:
- `cmd`: The command to run (extracted server-side from markdown)
- `aud`: "labspace" (audience)
- `exp`: 15-second expiration
- `terminalId`: Optional, from `terminal-id` metadata

### File Save Flow

When a user clicks "Save":

```
1. CodeBlock.jsx → saveFileCommand(sectionId, codeIndex)
2. WorkshopContext.jsx → POST /api/labspace/sections/:id/save-file
3. vscode.js → Extract code block and save-as path
4. vscode.js → POST to Unix socket with { filePath, body }
5. VS Code extension → Write file to workspace
```

### Variable System

Variables allow personalized content (e.g., usernames in commands).

**Definition** (in markdown):
```
::variableDefinition[username]{prompt="What is your Docker Hub username?"}
```

**Storage**: Variables are stored in memory on the API server (`labspaceService.variables`)

**Interpolation**: When section content is fetched, `$$username$$` is replaced with the stored value server-side. This ensures commands and file saves use the actual value.

**UI**: The `VariableDefinition` component renders an input card with a yellow border until the variable is set.

### Adding New Markdown Features

To add a new custom directive:

1. **Create the React component** in `components/interface/client/src/components/WorkshopPanel/markdown/`
2. **Register it** in `MarkdownRenderer.jsx` under the `components` prop
3. **Use lowercase name** - the directive name must match the component key (e.g., `::myDirective` → `mydirective: MyDirective`)

To add new code block metadata:

1. **Update `codeIndexer.js`** to parse the new metadata and set a data attribute
2. **Update `CodeBlock.jsx`** to read the attribute and render accordingly

### Markdown Extensions Summary

Beyond GitHub Flavored Markdown, labspaces support:

- **Code blocks**: `bash`/`shell` blocks get Run buttons; `save-as=path` adds Save button
- **Disable buttons**: `no-copy-button`, `no-run-button` metadata
- **Terminal targeting**: `terminal-id=name` runs command in a specific named terminal
- **Tab links**: `::tabLink[text]{href="url" title="Tab Title"}`
- **File links**: `:fileLink[text]{path="file.txt" line=10}`
- **Variables**: `::variableDefinition[name]{prompt="Enter value"}` then use `$$name$$`
- **Mermaid diagrams**: Standard mermaid code blocks
- **GitHub alerts**: `> [!NOTE]`, `> [!WARNING]`, etc.

## Code Style and Formatting

### Prettier

All Node.js projects are configured with Prettier for consistent formatting. **Always run Prettier after making changes** to keep formatting consistent:

```bash
# Format all files in a project
npm run prettier

# Check formatting without modifying (useful for CI)
npm run prettier-check
```

Available in:
- `components/interface/api/`
- `components/interface/client/`

Pre-commit hooks for Prettier and ESLint are planned but not yet in place. Until then, manually run `npm run prettier` before committing changes to Node projects.

### ESLint

ESLint is configured in some projects. Run linting with:

```bash
npm run lint
```

## Common Tasks

### Adding Markdown Features

1. Frontend rendering: `components/interface/client/src/components/`
2. Backend processing: `components/interface/api/src/services/labspace.js`
3. Document in: `docs/markdown-options.md`

### Updating Dependencies

**Docker CLI plugins** (`components/workspace/base/Dockerfile`):

1. Find each `COPY --from=` line that pulls a CLI plugin:
   ```dockerfile
   COPY --from=docker/scout-cli:1.19.0 /docker-scout ...
   COPY --from=docker/docker-model-cli-desktop-module:v1.0.4 ...
   COPY --from=docker/docker-mcp-cli-desktop-module:v0.32.0 ...
   ```
2. Check Docker Hub for each image to find the latest semver tag
3. Update to the newest tag (never use `:latest`)
4. Note: The `docker:28.x` image is intentionally pinned below v29 due to Engine API compatibility with some Testcontainers libraries

**Base workspace image**:

1. Check Docker Hub for `codercom/code-server` latest semver tag
2. Update the `FROM` line (currently `codercom/code-server:4.106.3`)
3. Never use `:latest`

**Node dependencies**: Update `package.json` in respective component directories, then run `npm install` to update lockfile

### Adding a New Workspace Preset

1. Create `components/workspace/<preset>/Dockerfile` inheriting from `labspace-workspace-base`
2. Add target to `docker-bake.hcl`
3. Document in `docs/configuration.md`

## Build & Release

### Local Build

```bash
docker buildx bake
```

### CI/CD (GitHub Actions)

- On `main` push: Build and push `:dev` tags
- On git tag: Build and push `:latest` + version tags
- Publishes images to Docker Hub under `dockersamples/`
- Publishes Compose files as OCI artifacts

### Image Targets

Defined in `docker-bake.hcl`:
- `interface`, `configurator`, `support-vscode-extension`
- `workspace-base`, `workspace-node`, `workspace-java`, `workspace-python`
- `host-port-republisher`, `labspace-cleaner`

## Testing

Currently minimal - manual testing via the compose stacks is the primary method. Tests should be added; when contributing, ensure changes work with:

```bash
# Infrastructure changes
docker compose up --watch --build

# Content rendering changes
# Test with sample-content-repo and verify in browser
```

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `CONTENT_DEV_MODE` | interface | Enable hot-reload for content |
| `CONTENT_REPO_URL` | configurator | Git URL to clone content from |
| `CONTENT_PATH` | compose.content-dev.yaml | Local path for content development |
| `MARLIN_ENDPOINT` | interface | Analytics endpoint URL |
| `MARLIN_API_KEY` | interface, marlin-mock | Analytics API key |
| `LABEL_FILTER` | host-republisher, cleaner | Label selector for resources |
| `DEV_MODE` | configurator | Use staging directory instead of cloning |

## Important Patterns

### Naming Conventions

- Prefix container-related names with `labspace-` to avoid conflicts
- Use `.labspace/` directory in content repos for configuration

### Component Dependencies

- VS Code extension changes may require interface updates (if calling extension APIs)
- Workspace base changes affect all workspace presets
- Socket proxy config changes affect all Docker operations

## Things to Avoid

- Don't modify socket proxy security controls without careful review
- Don't remove labels from containers (breaks cleanup and filtering)
- Don't bypass the socket proxy for Docker operations
- Don't hardcode paths - use environment variables and configuration
