# 🐳 The Docker environment

The Docker environment in this Labspace is a special environment. A few key things to note:

1. 🐳 **It uses the host engine.** The Labspace uses a mounted socket. No Docker-in-Docker. This provides the ability to use the Docker Desktop dashboard to view logs, troubleshoot or debug containers, and more.

2. 🔍 **It only shows what's going on in the Labspace.** While there may be other containers running on the host, the Labspace only shows those launched by the Labspace. This helps participants stay focused on what's going on in the Labspace and not be distracted by what's going on around them.

3. 📦 **The entire environment runs out of a volume.** These instructions, the IDE files, and everything is cloned into a volume and mounted where needed. This allows the entire environment to be portable (and Offload-compatible!), but also introduces a few tricky elements (which we'll talk about).

Let's dive deeper into the environment.


## 🔍 Resource filtering

Let's start off by looking at the resource filtering.

1. If you haven't yet, launch the VS Code server in the panel on the right.

2. In the terminal, run the following command:

    ```sh
    docker ps
    ```

    You should see... nothing running! But, there are obviously other containers running in order to run the Labspace.

    Open the Docker Desktop dashboard and you'll see several containers, including those running the Labspace!

3. Start a new container with the following command:

    ```sh
    docker run -dp 80:80 --name=demo docker/welcome-to-docker
    ```

4. Open http://localhost to see the container's website in the browser.

5. Validate you see the container running in the Labspace:

    ```sh
    docker ps
    ```

    You should see output similar to the following:

    ```plaintext
    CONTAINER ID   IMAGE                      COMMAND                  CREATED         STATUS         PORTS                                 NAMES
    8eef92106732   docker/welcome-to-docker   "/docker-entrypoint.…"   4 seconds ago   Up 4 seconds   0.0.0.0:80->80/tcp, [::]:80->80/tcp   demo
    ```

    You see that container, but again... no other containers on the host!


### How's it work?

The Docker Socket Proxy in the Labspace is doing two things:

- **Filter all list responses** - when querying for lists of containers, images, networks, and volumes, only items with the labspace label are returned.
- **Mutate labels onto new resources** - when new items are created, add a label to the newly created resource.

With these two capabilities, the Labspace is able to show only the items created from inside the Labspace.

1. Query for the labels for the container you just created:

    ```sh
    docker inspect demo --format='{{json .Config.Labels}}'
    ```

    In that output, you should see a label indicating it is a labspace resource!

    ```json
    {"labspace-resource":"true","maintainer":"NGINX Docker Maintainers <docker-maint@nginx.com>"}
    ```

This is accomplished with the following config in the socket proxy:

```yaml
mutators:
  - type: addLabels
    labels:
      labspace-resource: "true"
responseFilters:
  - type: labelFilter
    requiredLabels:
      labspace-resource: "true"
```


## 🔀 Ensuring mount paths work

If you were to run the following command in the IDE terminal, you'd probably expect it to fail:

```sh
docker run --name=mount-demo -v ./:/data ubuntu ls /data
```

And, it _should_ fail for two different reasons:

- **The source path doesn't exist on the host.** The working path in the VS Code editor is `/home/coder/project`, which doesn't exist on the host. When the source directory doesn't exist, this would normally cause an error.

- **The Labspace is operating out of a volume.** Even _if_ the path existed on the host, the Labspace is in a volume. So, we really need the paths to use the volume path and even be smart enough to do sub-pathing.

With these two, the accurate command would need to look like this:

```sh
docker run --rm --mount=type=volume,src=labspace-content,target=/data ubuntu ls /data
```

Simply put... **this is not very user-friendly** and leaks a lot of the details on how the environment is structured.

With these limitations, we wouldn't be able to do _anything_ that uses mounts - no schema setup, no mounting configs into containers, etc.

But... it works! (Really... try it out!)

### How's it work?

The Docker Socket Proxy is configured to remap all bind mount requests to `/home/coder/project` to use the `labspace-content` volume. The mutator is smart enough to convert the bind mount into a volume mount and even configure any required subpathing.

1. Inspect the mounts for the container you created earlier:

    ```sh
    docker inspect mount-demo --format='{{json .Mounts}}' | jq .
    ```

    The output shows a _volume_ mount for `labspace-content`, even though the command specified a bind mount.

    ```json
    [
      {
        "Type": "volume",
        "Name": "labspace-content",
        "Source": "/var/lib/docker/volumes/labspace-content/_data",
        "Destination": "/data",
        "Driver": "local",
        "Mode": "z",
        "RW": true,
        "Propagation": ""
      }
    ]
    ```

This is accomplished with the following configuration in the socket proxy:

```yaml
mutators:
  - type: mountPath
    from: /home/coder/project
    to: labspace-content
  - type: mountPath
    from: /var/run/docker.sock
    to: labspace-socket-proxy/docker.sock
```

You'll notice in this config one other rewrite - **the proxied socket is also passed on to other containers that need the socket**, ensuring they have the same rights and access as the Labspace too.



## ✅ Mount path allow-listing

Going beyond mount rewriting, there is configuration that authorized only approved mount paths while in the Labspace environment. This is to ensure you are not able to mount host resources into the lab.

1. Try it out by attempting to mount the `/tmp` directory into a new container:

    ```sh
    docker run -v /tmp:/other-temp ubuntu
    ```

    While running this, you should get the following error message:

    ```plaintext
    docker: Error response from daemon: Mounting /tmp is not allowed
    ```

### How's it work?

This is accomplished with the following configuration in the socket proxy:

```yaml
gates:
  - type: mountSource
    allowedSources:
      - labspace-content
      - labspace-socket-proxy
      - buildx_buildkit_default_state
```

The sources here are the Labspace content repo, the Labspace socket proxy volume, and the default volume BuildKit creates when it performs a build.




## Next steps

Now that you see a little bit about how the Docker environment is configured, let's take a look at some of the networking aspects!
