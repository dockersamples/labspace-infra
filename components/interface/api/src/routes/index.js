import express from "express";
import configRouter from "./config.js";
import labspaceRouter from "./labspace.js";
import variableRouter from "./variables.js";

const router = express.Router();

router.use("/config", configRouter);
router.use("/labspace", labspaceRouter);
router.use("/variables", variableRouter);

export default router;
