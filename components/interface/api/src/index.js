import express from "express";
import { WorkshopStore } from "./workshopStore.js";

const app = express();
const PORT = process.env.PORT || 3030;

const workshopStore = new WorkshopStore();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/labspace", (req, res) => {
  res.json(workshopStore.getWorkshopDetails());
});

app.get("/api/sections/:sectionId", (req, res) => {
  const sectionId = req.params.sectionId;
  const content = workshopStore.getSectionDetails(sectionId);

  if (content) {
    res.json(content);
  } else {
    res.status(404).json({ error: "Section not found" });
  }
});

app.post("/api/sections/:sectionId/command", (req, res) => {
  const { codeBlockIndex } = req.body;
  workshopStore
    .executeCommand(req.params.sectionId, codeBlockIndex)
    .then(() => res.json({ success: true, message: "Command executed" }))
    .catch((error) => {
      console.error("Error executing command:", error);
      res.status(500).json({ error: "Failed to execute command" });
    });
});

// Send all unknown routes to the frontend to handle
app.get("*splat", (req, res) =>
  res.sendFile(path.resolve("public", "index.html")),
);

let server;

(async function () {
  await workshopStore.bootstrap();
  console.log("WorkshopStore bootstrapped");

  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      server.close(() => {
        console.log(`Server closed due to ${signal}`);
        process.exit(0);
      });
    });
  });
})();
