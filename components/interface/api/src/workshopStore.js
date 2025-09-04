import { parse } from "yaml";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { fetch, Agent } from "undici";

export class WorkshopStore {
  constructor() {
    this.sections = [];
    this.signingKey = fs.readFileSync(
      "/etc/cmd-executor/private-key/cmd-executor.key",
    );
  }

  async bootstrap() {
    const labspaceYaml = fs.readFileSync(
      path.join("/project", "labspace.yaml"),
      "utf8",
    );
    this.config = parse(labspaceYaml);

    this.config.sections = this.config.sections.map((section) => ({
      ...section,
      id: section.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters except spaces and dashes
        .replace(/\s+/g, "-"), // replace spaces with dashes
    }));
  }

  getWorkshopDetails() {
    if (process.env.CONTENT_DEV_MODE) this.bootstrap();

    const details = {
      title: this.config.title,
      subtitle: this.config.description,
      sections: this.config.sections.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    };

    if (process.env.CONTENT_DEV_MODE) {
      details.devMode = true;
    }

    return details;
  }

  getSectionDetails(sectionId) {
    if (process.env.CONTENT_DEV_MODE) this.bootstrap();

    const section = this.config.sections.find(
      (section) => section.id === sectionId,
    );

    if (!section) {
      console.warn(`Section with id ${sectionId} not found`);
      return null;
    }

    const filePath = path.join("/project", section.contentPath);
    const content = fs.readFileSync(filePath, "utf8");

    return {
      id: section.id,
      title: section.title,
      content,
    };
  }

  executeCommand(sectionId, codeBlockIndex) {
    const { content } = this.getSectionDetails(sectionId);

    const { code, meta } = this.#getCodeBlock(content, codeBlockIndex);

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

    return fetch("http://localhost/command", {
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
    }).then((res) => {
      if (!res.ok)
        throw new Error(`Failed to execute command: ${res.statusText}`);
    });
  }

  async saveFile(sectionId, codeBlockIndex) {
    const { content } = this.getSectionDetails(sectionId);

    const codeBlock = this.#getCodeBlock(content, codeBlockIndex);
    const fileName = codeBlock.meta["save-as"];
    if (!fileName) {
      throw new Error("Code block is missing 'save-as' metadata");
    }

    const filePath = path.join("/project", fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, codeBlock.code, "utf8");
  }

  #getCodeBlock(content, index) {
    const codeBlocks = content.match(/```(.*?)```/gs);
    if (!codeBlocks || codeBlocks[index] === undefined) {
      throw new Error(
        `Code block at index ${index} not found in section ${sectionId}`,
      );
    }

    const codeRows = codeBlocks[index].split("\n");
    const headerRow = codeRows.shift().substring(3);
    codeRows.pop(); // remove the closing ```

    const [language, ...metaInfo] = headerRow.split(" ");

    const meta = metaInfo.reduce((acc, cur) => {
      const [key, value] = cur.split("=");
      acc[key.trim()] = value ? value : "true";
      return acc;
    }, {});

    // Get the indentation to trim off extra text that might occur
    // when a code block is nested inside a list item
    const indentation = codeRows[0].match(/^\s*/)[0].length;

    return {
      language,
      code: codeRows.map((row) => row.substring(indentation)).join("\n"),
      meta,
    };
  }
}
