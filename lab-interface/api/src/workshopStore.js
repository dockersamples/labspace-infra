import { parse } from "yaml";
import fs from "fs";
import path from "path";

export class WorkshopStore {
  constructor() {
    this.sections = [];
  }

  async bootstrap() {
    if (!process.env.CONTENT_PATH) {
      throw new Error("CONTENT_PATH environment variable is not set");
    }

    const labspaceYaml = fs.readFileSync(path.join(process.env.CONTENT_PATH, "labspace.yaml"), "utf8");
    this.config = parse(labspaceYaml);

    this.config.sections = this.config.sections.map((section) => ({
      ...section,
      id: section.title.toLowerCase().replace(/\s+/g, "-"),
    }));
  }

  getWorkshopDetails() {
    return {
      title: this.config.title,
      subtitle: this.config.description,
      sections: this.config.sections.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    };
  }

  getSectionDetails(sectionId) {
    const section = this.config.sections.find(
      (section) => section.id === sectionId,
    );

    if (!section) {
      return null;
    }

    console.log("Section", section);
    
    const content = fs.readFileSync(path.join(process.env.CONTENT_PATH, section.contentPath), "utf8");

    return {
      id: section.id,
      title: section.title,
      content
    };
  }
}
