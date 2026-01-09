import fs from "fs";
import { fetch } from "undici";
import { labspaceService } from "./labspace.js";


export class AnalyticsPublisher {
  constructor() {
    const labspaceMetadata = JSON.parse(fs.readFileSync("/etc/labspace-support/metadata/metadata.json", "utf8"));

    this.optIn = labspaceMetadata.analytics_enabled === true;

    this.labspaceId = labspaceMetadata.labspace_id;
    this.labspaceMode = labspaceMetadata.labspace_mode;
    this.hubUserId = labspaceMetadata.uuids.hub;
    this.ddUserId = labspaceMetadata.uuids.dd;
    this.infraVersion = labspaceMetadata.infra_version;
    this.sourceRepo = labspaceMetadata.source_repo;
    this.contentVersion = labspaceMetadata.content_version;
    
    this.queuedEvents = [];
    this.startTimestamp = Date.now();
    this.previousSectionId = null;
    this.sectionsVisited = new Set();

    console.log(`AnalyticsPublisher initialized. ${this.optIn ? "Analytics enabled" : "Analytics disabled"}`);
  }

  publishStartEvent() {
    return this.#sendEvent("lifecycle", {
      action: "start",
      launched_at: this.startTimestamp,
      num_sections_total: labspaceService.config.sections.length,
    });
  }

  publishStopEvent() {
    return this.#sendEvent("lifecycle", {
      action: "stop",
      launched_at: this.startTimestamp,
      stopped_at: Date.now(),
      num_sections_total: labspaceService.config.sections.length,
      num_sections_visited: this.sectionsVisited.size,
    });
  }

  publishUserActionEvent(action, sectionId, codeBlockIndex, isSuccess) {
    return this.#sendEvent("user_action", {
      action,
      section_id: sectionId,
      code_block_index: codeBlockIndex,
      is_success: isSuccess,
    });
  }

  publishSectionChangeEvent(sectionId) {
    const prevSection = this.previousSectionId;
    if (sectionId === this.previousSectionId) {
      return;
    }

    this.previousSectionId = sectionId;
    this.sectionsVisited.add(sectionId);

    return this.#sendEvent("user_action", {
      action: "section_change",
      section_id: sectionId,
      prev_section: prevSection,
    });
  }

  async #sendEvent(event, eventProperties) {
    if (!this.optIn) return;

    const enhancedEvent = {
      event,
      source: "labspace",
      event_timestamp: Date.now(),
      properties: {
        ...eventProperties,
        labspace_id: this.labspaceId,
        labspace_source_repo: this.sourceRepo,
        labspace_content_version: this.contentVersion,
        labspace_mode: this.labspaceMode,
        labspace_infra_version: this.infraVersion,
      },
    };

    enhancedEvent.properties.hub_user_uuid = this.hubUserId;
    enhancedEvent.properties.desktop_instance_uuid = this.ddUserId;

    this.queuedEvents.push(enhancedEvent);
    const headers = {
      "Content-Type": "application/json",
    };

    if (process.env.MARLIN_API_KEY) {
      headers["x-api-key"] = process.env.MARLIN_API_KEY;
    }

    return fetch(process.env.MARLIN_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [ enhancedEvent ]
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Non-200 response from analytics endpoint: ${res.status} - ${text}`);
      }
    }).catch((err) => {
      console.error("Failed to send analytics event:", err);
    });
  }
}

export const analyticsPublisher = new AnalyticsPublisher();