# 📞 Mimicking the host network

When introducing people to containers, we often have them start a database, expose it on the host, and then have them connect to it.

And since the container is exposed, you should be able to simply connect to `localhost`.

BUT... we're running in a containerized lab environment. So, how can we mimic the ease of running things on the native machine without introducing and having folks need to use `host.docker.internal` (which doesn't resolve while in Docker Offload as well).

## 📋 Try it out

1. In the VS Code terminal, run the following command to start a PostgreSQL container:

    ```sh
    docker run -dp 5432:5432 -e POSTGRES_PASSWORD=secret postgres
    ```

2. Connect to the database using `psql`:

    ```sh
    psql -h localhost -U postgres
    ```

3. When you're prompted for the password, simply enter the configured password:

    ```sh
    secret
    ```
    
    You should see it connect!

4. When you're done run the following command in the postgres terminal to exit:

    ```sh
    \q
    ```


### How's it work?

The Labspace environment contains a service called the **host-port-republisher**. It does the following:

1. Watches for container start events for Labspace resources (remember the label we're mutating on?)
2. Extract published ports and determine the IP address for the container on the `labspace` network
3. Start `socat` processes to forward traffic from `localhost:PORT` to `container:PORT`.

Effectively, we're creating small proxies to forward traffic from localhost:PORT directly to the containerized port.

This works because **the republisher service runs in the same network namespace as the IDE**. With this, `localhost` is the same for the workspace and host-port-republisher containers.

To ensure the communication works, the Docker Socket Proxy is mutating all new containers to put them on the Labspace network:

```yaml
mutators:
  - type: addToNetwork
    networks:
      - labspace
```




## Next steps

Now that you've learned about some of the networking aspects, let's take a look at the custom VS Code extension.
