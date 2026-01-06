export class AnalyticsPublisher {
  constructor() {
    this.optOut = false;

    this.labspaceId = "dockersamples/labspace-placeholder";
    this.labspaceVersion = "abcd1234"; // git commit hash (only set when mode is 'standard')
    this.labspaceMode = "standard"; // standard | dev | local

    this.userId = "user-id";
    this.hubUserId = "hub-user-id";
  }

  publishEvent(event, eventProperties) {
    if (this.optOut) return;

    const enhancedEvent = {
      event,
      source: "labspace",
      properties: {
        ...eventProperties,
        labspace_id: this.labspaceId,
        labspace_version: this.labspaceVersion,
        labspace_mode: this.labspaceMode,
        timestamp: new Date().toISOString(),
      },
    };

    if (this.hubUserId) {
      enhancedEvent.properties.hub_user_uuid = this.hubUserId;
    } else {
      enhancedEvent.properties.user_uuid = this.userId;
    }

    console.log("Publishing analytics event:", enhancedEvent);
  }

  setOptOut(optOut) {
    this.optOut = optOut;
    console.log(`Analytics opt-out set to: ${optOut}`);
  }

  isOptedOut() {
    return this.optOut;
  }
}
