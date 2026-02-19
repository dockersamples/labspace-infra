# 🐳 The Docker environment

## 🔍 Test one - validate filtering and host port republishing

Let's start off by looking at the resource filtering.

1. Open the :tabLink[IDE]{href="http://localhost:8085" id="ide"}

2. In the terminal, run the following command:

    ```sh
    docker ps
    ```

    Validate you don't see anything

3. Start a new container with the following command:

    ```sh
    docker run -dp 80:80 --name=demo docker/welcome-to-docker
    ```

4. Validate you see the container when running `docker ps`:

    ```sh
    docker ps
    ```

5. Open :tabLink[the application]{href="http://localhost" id="app"} to see the container's website in the browser.

6. Run the following command and validate you see the website using the container's localhost:

    ```sh
    curl localhost
    ```

7. Remove the container:

    ```sh
    docker rm -f demo
    ```


## 🔀 Test two - ensuring mount path rewriting works

This test validates the socket proxy is configured correctly to rewrite mount points

1. Run the following command:

    ```sh
    docker run --rm -v ./:/data ubuntu /data/run.sh
    ```

    If it was successful, you should see output similar to the following:

    ```plaintext no-copy-button no-run-button
    Just a simple script to say hello
    ```


## ✅ Test three - mount path allow-listing

Going beyond mount rewriting, there is configuration that authorized only approved mount paths while in the Labspace environment. This is to ensure you are not able to mount host resources into the lab.

1. Try it out by attempting to mount the `/tmp` directory into a new container:

    ```sh
    docker run -v /tmp:/other-temp ubuntu
    ```

    While running this, you should get the following error message:

    ```plaintext
    docker: Error response from daemon: Mounting /tmp is not allowed
    ```
