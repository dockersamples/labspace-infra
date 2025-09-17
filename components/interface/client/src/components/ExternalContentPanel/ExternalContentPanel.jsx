import { IdePlaceholder } from "./IdePlaceholder";
import { useTabs } from "../../TabContext";
import "./ExternalContentPanel.scss";
import { ExternalTabs } from "./ExternalTabs";
import { useRef } from "react";

export function ExternalContentPanel() {
  const { tabs, setActiveTab, activeTab, addTab, removeTab } = useTabs();
  const iframeRef = useRef();

  return (
    <div className="d-flex flex-fill flex-column">
      <div className="p-3 pt-2 pb-0 bg-secondary-subtle">
        <ExternalTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          onTabRemoval={removeTab}
        />
      </div>
      {activeTab ? (
        <iframe
          ref={iframeRef}
          style={{ flex: 1, border: "none" }}
          src={activeTab}
        />
      ) : (
        <IdePlaceholder
          onLaunch={() => addTab("http://localhost:8085", "Workspace")}
        />
      )}
    </div>
  );
}
