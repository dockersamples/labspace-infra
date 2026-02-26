# Additional elements

| Part | Meaning |
|------|---------|
| `-d` | **Detached** — run in the background, return the terminal to you |
| `-p 8080:80` | **Port mapping** — forward host port `8080` to container port `80` |
| `--name my-nginx` | Give the container a friendly name instead of a random one |
| `nginx` | The image to use (pulled from Docker Hub automatically) |