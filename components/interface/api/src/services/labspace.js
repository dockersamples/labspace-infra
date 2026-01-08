import { parse } from "yaml";
import fs from "fs";
import path from "path";

export class LabspaceService {
  constructor() {
    this.sections = [];
    this.variables = {};
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

  getLabspaceDetails() {
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
    const content = fs
      .readFileSync(filePath, "utf8")
      .replace(/\$\$([^\$]+)\$\$/g, (_, varName) => {
        const key = varName.trim();
        const has =
          this.variables &&
          Object.prototype.hasOwnProperty.call(this.variables, key);
        const value = has ? this.variables[key] : undefined;
        if (value === undefined || value === null) return key;
        return String(value);
      });

    return {
      id: section.id,
      title: section.title,
      content,
    };
  }

  setVariable(key, value) {
    this.variables[key] = value;
  }

  getVariables() {
    return this.variables;
  }

  getCodeBlock(sectionId, index) {
    const { content } = this.getSectionDetails(sectionId);
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

export const labspaceService = new LabspaceService();
