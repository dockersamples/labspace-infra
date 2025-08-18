import { useState } from "react";
import { IdePlaceholder } from "./IdePlaceholder";

export function IdePanel() {
  const [displayIde, setDisplayIde] = useState(false);

  if (!displayIde) {
    return <IdePlaceholder onLaunch={() => setDisplayIde(true)} />;
  }

  return (
    <iframe
      style={{ flex: 1 }}
      src="http://localhost:8085"
      title="VS Code IDE"
    />
  );
}
