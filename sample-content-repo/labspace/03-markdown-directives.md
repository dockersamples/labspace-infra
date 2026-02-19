# Markdown directives

This page is intended to provide examples and testing of the various Markdown directives supported in Labspaces.

## GitHub callouts

These should render as callouts

> [!NOTE]
> This is a note callout

> [!CAUTION]
> This is a caution callout

> [!WARNING]
> This is a warning callout



## File saving support

1. Save the following `Dockerfile`:

    ```dockerfile save-as=Dockerfile
    FROM node:lts-slim
    WORKDIR /usr/local/app
    COPY package* ./
    RUN npm install
    COPY src ./src
    CMD ["node", "src/index.js"]
    ```

## File open support

1. Open the :fileLink[`Dockerfile`]{path="Dockerfile"}

2. Close the Dockerfile

3. Click :fileLink[this link]{path="Dockerfile" line=3} and validate it goes to line #3


## Tab link support

1. Run the following command to start a container on port 8082:

    ```bash
    docker run -dp 8082:80 --name=tab-demo docker/welcome-to-docker
    ```

2. Click :tabLink[this link]{href="http://localhost:8082" id="app"} to validate the _App_ tab activates and displays the app.

3. Validate the URL is http://localhost:8082 (by hovering on the link). Right-clicking should support opening the expected app in a new browser tab.

4. Stop the container:

    ```bash
    docker rm -f tab-demo
    ```

5. Start one more container using a different port:

   ```bash
   docker run -dp 8094:5000 --name=cats mikesir87/cats:1.0
   ```

6. Click :tabLink[this link]{href="http://localhost:8094" id="app"} to validate the _App_ tab activates and displays the cat app.

7. Validate the link is now pointing to http://localhost:8094.

8. Stop the container:

    ```bash
    docker rm -f cats
    ```

9. :tabLink[This link]{id="ide"} should open the IDE

## Mermaid charts

Validate this Mermaid chart renders as expected:

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```