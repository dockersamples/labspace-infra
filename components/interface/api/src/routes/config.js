import express from "express";
import { config } from "../config.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(config);
});

export default router;
