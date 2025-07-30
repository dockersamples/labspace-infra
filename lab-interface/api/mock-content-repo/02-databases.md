# 📦 Running Your First PostgreSQL Container

This tutorial will guide you through running a PostgreSQL database using Docker.

## Steps

1. **Pull the PostgreSQL image**

    Download the [Postgres](https://hub.docker.com/_/postgres) container image by using the `docker pull` command:

    ```sh
    docker pull postgres
    ```

2. **Run the PostgreSQL container**

    Start a container by using the `docker run` command:

    ```sh
    docker run --name my-postgres \
      -e POSTGRES_PASSWORD=mysecretpassword \
      -p 5432:5432 \
      -d postgres
    ```

    - `--name my-postgres` - names your container.
    - `-e POSTGRES_PASSWORD=...` - sets the database password.
    - `-p 5432:5432` - exposes Postgres's default port on the host, allowing us to connect to it.
    - `-d` - runs the container in detached mode, or in the background.

3. **Connect to PostgreSQL**

    Connect to the container's exposed port by using the `psql` CLI tool:

    ```sh
    psql -h localhost -U postgres
    ```

    Enter the password you set (`mysecretpassword`) when prompted.

## Stopping and Removing the Container

```sh
docker stop my-postgres
docker rm my-postgres
```

You're now running PostgreSQL in a Docker container!