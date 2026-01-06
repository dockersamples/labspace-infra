import path from "path";
import express from "express";
import { onShutdown } from "node-graceful-shutdown";
import { labspaceService } from "./services/labspace.js";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

// Interface assets and API
app.use(express.static("public"));
app.use("/api", router);

// Content resources
app.use(express.static("/project", { dotfiles: "allow" }));

// Send all unknown routes to the frontend to handle
app.get("*splat", (req, res) =>
  res.sendFile(path.resolve("public", "index.html")),
);

async function run() {
  await labspaceService.bootstrap();
  console.log("Labspace bootstrapped");

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  onShutdown(async () => new Promise((resolve) => server.close(resolve)));
}

run();
