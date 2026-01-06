import fs from "fs";
import jwt from "jsonwebtoken";
import { fetch, Agent } from "undici";
import { labspaceService } from "./labspace.js";

export class VsCodeService {
  constructor() {
    this.signingKey = fs.readFileSync(
      "/etc/cmd-executor/private-key/cmd-executor.key",
    );
  }

  async executeCommand(sectionId, codeBlockIndex) {
    const { code, meta } = labspaceService.getCodeBlock(
      sectionId,
      codeBlockIndex,
    );

    const payload = {
      cmd: code,
      aud: "cmd-executor",
      exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
    };

    if (meta["terminal-id"]) {
      payload.terminalId = meta["terminal-id"];
    }

    const token = jwt.sign(payload, this.signingKey, { algorithm: "ES256" });

    const res = await fetch("http://localhost/command", {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: {
        "Content-Type": "application/json",
      },
      dispatcher: new Agent({
        connect: {
          socketPath: "/etc/cmd-executor/socket/cmd-executor.sock",
        },
      }),
    });

    if (!res.ok)
      throw new Error(`Failed to execute command: ${res.statusText}`);
  }

  async saveFile(sectionId, codeBlockIndex) {
    const codeBlock = labspaceService.getCodeBlock(sectionId, codeBlockIndex);
    const fileName = codeBlock.meta["save-as"];
    if (!fileName) {
      throw new Error("Code block is missing 'save-as' metadata");
    }

    const res = await fetch("http://localhost/save", {
      method: "POST",
      body: JSON.stringify({ filePath: fileName, body: codeBlock.code }),
      headers: {
        "Content-Type": "application/json",
      },
      dispatcher: new Agent({
        connect: {
          socketPath: "/etc/cmd-executor/socket/cmd-executor.sock",
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to save file: ${res.statusText}`);
    }
  }

  async openFileInIDE(filePath, line) {
    const res = await fetch("http://localhost/open", {
      method: "POST",
      body: JSON.stringify({ filePath, line }),
      headers: {
        "Content-Type": "application/json",
      },
      dispatcher: new Agent({
        connect: {
          socketPath: "/etc/cmd-executor/socket/cmd-executor.sock",
        },
      }),
    });

    if (!res.ok)
      throw new Error(`Failed to execute command: ${res.statusText}`);
  }
}

export const vscodeService = new VsCodeService();
