# Creating a Labspace

This document is intended to provide the steps and details necessary to create a Labspace.

If you are making a Labspace and find gaps, feel free to update these docs and submit a PR or create an issue to let us know!



## Getting started

1. Create a repository that will host your content

2. At the root of the repository, create a `labspace.yaml` file. That file should have content similar to the following:

    ```yaml
    title: Labspace title
    description: |
      The description of the Labspace, generally in 100 characters or less

    sections:
      - title: Section One
        contentPath: .labspace/section-one.md
      - title: Section Two
        contentPath: .labspace/section-two.md
    ```

    > [!TIP]
    > While it's not required to put everything in the `.labspace` directory, it is highly recommended as it helps provide a better
    > experience for participants as it helps reduce clutter in the development environment.

3. Write the content for each of the sections. See the [Markdown Options](./markdown-options.md) for Markdown-specific capabilities.

4. Create a `.labspace/compose.override.yaml` file. This file will contain any overrides you need to make to the default Labspace environment (see [Configuration](./configuration.md) for more info).

    ```yaml
    services:
      configurator:
        environment:
          PROJECT_CLONE_URL: https://github.com/your-repo-owner/your-repo-name

      workspace:
        # Custom workspace changes here
    ```

    The `PROJECT_CLONE_URL` won't be used during development, but will be used when starting the Labspace.

5. To start the development environment, run the following command from the root of your repo:

    ```console
    # Mac/Linux
    CONTENT_PATH=$PWD docker compose -f oci://dockersamples/labspace-content-dev -f .labspace/compose.override.yaml up

    # On Windows with PowerShell
    $Env:CONTENT_PATH = (Get-Location).Path; docker compose -f oci://dockersamples/labspace-content-dev -f .labspace/compose.override.yaml up
    ```

    Once the stack starts, you can open the app at [http://localhost:3030](http://localhost:3030). 

    The files are bind mounted into the container environment



## Publishing a Labspace

Publishing a Labspace is as simple as publishing a Compose file. With the base Compose file, you only need to apply your overrides to make it your own!

1. Set a few environment variables to make it easier to publish, swap the values to match the username and repo you want to publish to:

    ```console
    # Mac/Linux
    export HUB_USERNAME=moby
    export HUB_REPO=labspace-demo

    # Windows with PowerShell
    $Env:HUB_USERNAME = "moby"
    $Env:HUB_REPO = "labspace-demo"
    ```

2. Publish the Compose file with the following command:

    ```console
    docker compose -f oci://dockersamples/labspace -f .labspace/compose.override.yaml publish ${HUB_USERNAME}/${HUB_REPO} --with-env -y
    ```

    This will merge the two Compose files together and publish it as an OCI artifact. This example would publish to `moby/labspace-demo`.

    You will likely be prompted to confirm a few settings (some of which will be removed in the next Compose release).



## Trying your Labspace

With your Labspace published as an OCI artifact, it's a single `docker compose up` command away from launching.

1. If you have a Labspace running, make sure to shut it down first (stop the containers):

    ```console
    docker rm -f $(docker ps -aq)
    ```

2. Start the new Labspace

    ```console
    docker compose -f oci://${HUB_USERNAME}/${HUB_REPO} up -y
    ```

