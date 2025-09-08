# Labspace Infra

This repository provides the infrastructure and components required to run Labspaces.

![Screenshot of the project opened in the browser using VS Code server](./screenshot.png)

## Try it out

To try out a Labspace, run the following command:

```bash
docker compose -f oci://dockersamples/labspace-container-supported-development up
```

Once the containers have started, open your browser to http://localhost:3030 and you’ll see the Labspace!

Click the **Load VS Code here** button to display the VS Code IDE in the right side panel.


## Documentation

To learn more about Labspaces or to see documentation on writing your own, check out the [./docs](./docs) directory.


## Development

To work on the Labspace infrastructure, you can utilize the `compose.yaml` file. Make sure to enable Compose Watch mode with the `--watch` flag.

```console
docker compose up --watch --build
```

After it starts, open the interface at http://localhost:5173.


## Known limitations

- Running multiple Labspaces concurrently is not supported at this time on the same machine
- Volume names are currently hard-coded in the Compose file (for remapping/allowlisting of mount sources)
