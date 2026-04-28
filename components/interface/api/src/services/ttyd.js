import { labspaceService } from "./labspace.js";

export class TtydService {
  constructor(baseUrl, apiToken) {
    this.baseUrl = baseUrl || "http://host.docker.internal:8085";
    this.headers = {
      "Content-Type": "application/json",
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
    };
  }

  async executeCommand(sectionId, codeBlockIndex) {
    const { code, meta } = labspaceService.getCodeBlock(
      sectionId,
      codeBlockIndex,
    );

    const body = { cmd: code };
    if (meta["terminal-id"]) {
      body.terminalId = meta["terminal-id"];
    }

    const res = await fetch(`${this.baseUrl}/api/command`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: this.headers,
    });

    if (!res.ok) throw new Error(`Failed to execute command: ${res.statusText}`);
  }

  async saveFile(sectionId, codeBlockIndex) {
    const codeBlock = labspaceService.getCodeBlock(sectionId, codeBlockIndex);
    const fileName = codeBlock.meta["save-as"];
    if (!fileName) {
      throw new Error("Code block is missing 'save-as' metadata");
    }

    const res = await fetch(`${this.baseUrl}/api/save`, {
      method: "POST",
      body: JSON.stringify({ filePath: fileName, body: codeBlock.code }),
      headers: this.headers,
    });

    if (!res.ok) {
      const e = new Error(`Failed to save file: ${res.statusText}`);
      e.fileName = fileName;
      throw e;
    }
    return fileName;
  }

  // File-open has no meaningful equivalent in a raw terminal; silently succeed.
  async openFileInIDE(_filePath, _line) {}
}
