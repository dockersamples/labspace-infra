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

    const codeBlocks = content.match(/```(.*?)```/gs);
    if (!codeBlocks || codeBlocks[codeBlockIndex] === undefined) {
      throw new Error(
        `Code block at index ${codeBlockIndex} not found in section ${sectionId}`,
      );
    }

    const command = codeBlocks[codeBlockIndex]
      .split("\n")
      .slice(1, -1)
      .join("\n")
      .trim();
    const payload = {
      cmd: command,
      aud: "cmd-executor",
      exp: Math.floor(Date.now() / 1000) + 15, // 15 seconds
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
    };

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
}
