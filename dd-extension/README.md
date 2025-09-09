# Docker Desktop extension

This directory contains the code for the Docker Desktop extension for Labspaces.

## Development

To develop the extension, run the following steps:

1. Install the NPM dependencies:

    ```console
    npm install
    ```

2. Start the app:

    ```console
    npm run dev
    ```

3. If you don't have the extension installed yet, install it:

    ```console
    docker extension install dockersamples/labspace-extension
    ```

4. Enable debug mode for the extension (to get the Chrome developer tools):

    ```console
    docker extension dev debug dockersamples/labspace-extension
    ```

5. Set the UI source for the extension to be your development environment:

    ```console
    docker extension dev ui-source dockersamples/labspace-extension http://localhost:5173
    ```

6. Open the extension in Docker Desktop. It will now be using the Vite reload server for the UI, allowing you to make changes and see them reflected immediately.

## Deep link support

Once the extension is installed, deep links can be used to launch a Labspace.

```
http://open.docker.com/dashboard/extension-tab?extensionId=dockersamples/labspace-extension&url=PUBLISHED_LABSPACE_URL&title=TITLE
```

[Click here](http://open.docker.com/dashboard/extension-tab?extensionId=dockersamples/labspace-extension&url=dockersamples/labspace-container-supported-development&title=Demo) to launch a sample Labspace