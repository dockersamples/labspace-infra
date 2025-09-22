export class LogProcessor {
  constructor() {
    this.lines = [];
    this.identifierToLineMapping = new Map();

    this.downloadPattern = /^(.+?)\s+(Pull|Download|Extracting)/;
    this.resourceCreationPattern = /(Container|Volume)\s+([a-z0-9-]+)\s+/;
  }

  reset() {
    this.lines = [];
    this.identifierToLineMapping = new Map();
  }

  processLine(line) {
    const downloadMatch = line.match(this.downloadPattern);
      
    if (downloadMatch) {
        const identifier = downloadMatch[1].trim();

        if (this.identifierToLineMapping.has(identifier)) {
            this.lines[this.identifierToLineMapping.get(identifier)] = line;
        } else {
            this.identifierToLineMapping.set(identifier, this.lines.length);
            this.lines.push(line);
        }
    } else if (this.resourceCreationPattern.test(line)) {
        const identifier = line.match(this.resourceCreationPattern)[2];
        if (this.identifierToLineMapping.has(identifier)) {
            this.lines[this.identifierToLineMapping.get(identifier)] = line;
        } else {
            this.identifierToLineMapping.set(identifier, this.lines.length);
            this.lines.push(line);
        }
    } else {
        this.lines.push(line);
    }

    return this.lines.join("\n");
  }
}