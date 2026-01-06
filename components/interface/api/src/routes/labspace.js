import express from "express";
import { labspaceService } from "../services/labspace.js";
import { vscodeService } from "../services/vscode.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(labspaceService.getLabspaceDetails());
});

router.post("/open-file", (req, res) => {
  const { filePath, line } = req.body;
  vscodeService
    .openFileInIDE(filePath, line)
    .then(() => res.json({ success: true }))
    .catch((error) => {
      console.error("Error opening file:", error);
      res.status(500).json({ error: "Failed to open file" });
    });
});

router.get("/sections/:sectionId", (req, res) => {
  const sectionId = req.params.sectionId;
  const content = labspaceService.getSectionDetails(sectionId);

  if (content) {
    res.json(content);
  } else {
    res.status(404).json({ error: "Section not found" });
  }
});

router.post("/sections/:sectionId/command", (req, res) => {
  const { codeBlockIndex } = req.body;
  vscodeService
    .executeCommand(req.params.sectionId, codeBlockIndex)
    .then(() => res.json({ success: true, message: "Command executed" }))
    .catch((error) => {
      console.error("Error executing command:", error);
      res.status(500).json({ error: "Failed to execute command" });
    });
});

router.post("/sections/:sectionId/save-file", (req, res) => {
  const { codeBlockIndex } = req.body;
  vscodeService
    .saveFile(req.params.sectionId, codeBlockIndex)
    .then(() => res.json({ success: true, message: "File saved" }))
    .catch((error) => {
      console.error("Error saving file:", error);
      res.status(500).json({ error: "Failed to save file" });
    });
});

export default router;
