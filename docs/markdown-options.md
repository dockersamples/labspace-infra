# Markdown options

This document is used to document the various options that exist when writing your Labspace content.

## General markdown support

The interface supports all of the GitHub Flavored Markdown features, as well as the [custom alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts).


## Embedding images

Image support exists, but all paths are anchored using the root of the repo, _not the markdown file_.

For example, given the following directory structure:

```
.
└── .labspace/
    └── images/
        └── screenshot.png
```

The image will be rendered with either of the following markdown snippets:

    ![Screenshot](/.labspace/images/screenshot.png)
    ![Screenshot](.labspace/images/screenshot.png)



## Code blocks

By default, every code block will be given a "Copy code" button. Additionally, any `bash`, `shell`, or `console` block will also be given a "Run" button.

There is also an ability to add a "Save as" button to enable easy file creation/saving.

### Disabling the copy button

In the cases you don't want the copy button to be made visible, add the `no-copy-button` metadata to the block.

This might be useful when showing sample console output that isn't intended to be something a user copies.

    ```plaintext no-copy-button
    CONTAINER ID   IMAGE                                      COMMAND                  CREATED         STATUS         PORTS                    NAMES
    7eb17e337a13   dockersamples/labspace-interface:v0.6.0    "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   0.0.0.0:3030->3030/tcp   labspace-infra-interface-1
    ...
    ```

This rendered code block will _not_ have the copy button.



### Disabling the run button

At times, you might want to disable the run button, but still render a code block using the syntax highlighting of a `bash` prompt. You can do so by using the `no-run-button` metadata.

    ```bash no-run-button
    docker ps
    ```

This rendered block will _not_ have the run button.



### Add a "Save file" button

To add a "Save file" button, use the `save-as=path/to/file.txt` metadata.

    ```yaml save-as=compose.yaml
    services:
      app:
        image: nginx
    ```

If a user clicks this "Save file" button, a `compose.yaml` file will be created with the following content.

- If the file already exists, the contents will be replaced with what is provided in the code block.
- All required directories leading up to the file will automatically be created