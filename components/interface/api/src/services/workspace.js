import { TtydService } from "./ttyd.js";
import { VsCodeService } from "./vscode.js";

// workspaceService is the singleton used by route handlers to execute commands
// and save files. Which implementation is selected depends on the WORKSPACE_TYPE
// environment variable injected by the Compose provider:
//
//   WORKSPACE_TYPE=ttyd   → HTTP calls to the ttyd server on the host
//   (anything else)       → Unix-socket calls to the VS Code extension
//
// When the provider service is named "workspace", Compose automatically prefixes
// every emitted setenv variable with "WORKSPACE_", so the provider emitting
// "TYPE=ttyd" produces WORKSPACE_TYPE=ttyd in this container.
function createWorkspaceService() {
  if (process.env.WORKSPACE_TYPE === "ttyd") {
    return new TtydService(
      process.env.WORKSPACE_API_URL,
      process.env.WORKSPACE_API_TOKEN,
    );
  }
  return new VsCodeService();
}

export const workspaceService = createWorkspaceService();
