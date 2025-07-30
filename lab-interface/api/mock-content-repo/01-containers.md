# 📦 Learning about containers

## Running Your First Container

Containers allow you to run applications in isolated environments. Let's get started with Docker, the most popular container platform.

### 1. Run a Hello World Container

Open your terminal and run:

```sh
docker run -p 80:80 docker/welcome-to-docker
```

This command downloads a small image and runs it in a container. If successful, you'll be able to open http://localhost and see a welcome message!

### 2. List Running Containers

To see running containers, use:

```sh
docker ps
```

To see all containers (including stopped ones):

```sh
docker ps -a
```

### 3. Clean Up

Remove the test container with:

```sh
docker rm <container_id>
```

Replace `<container_id>` with the actual ID from `docker ps`. 

**Pro tip:** you don't have to provide the full container ID. A partial ID works, as long as what you provide is unique enough to identify the container.

You're now ready to explore more with containers!