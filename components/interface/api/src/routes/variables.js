import express from "express";
import { labspaceService } from "../services/labspace.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(labspaceService.getVariables());
});

router.post("/", (req, res) => {
  const { key, value } = req.body;
  labspaceService.setVariable(key, value);
  res.json({ success: true });
});

export default router;
