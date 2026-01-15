import { IdePlaceholder } from "./IdePlaceholder";
import { useTabs } from "../../TabContext";
import "./ExternalContentPanel.scss";
import { ExternalTabs } from "./ExternalTabs";
import { useRef } from "react";
import { useConfig } from "../../ConfigContext";

export function ExternalContentPanel() {
  const config = useConfig();
  const { tabs, setActiveTab, activeTab, addTab, removeTab } = useTabs();
  const iframeRef = useRef();

  return (
    <div className="d-flex flex-fill flex-column">
      <div className="p-3 pt-2 pb-0 bg-light-subtle">
        <ExternalTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          onTabRemoval={removeTab}
          onRefreshClick={() => {
            const url = new URL(iframeRef.current.src);
            url.searchParams.set("t", Date.now());
            iframeRef.current.src = url.toString();
          }}
        />
      </div>
      {tabs.length > 0 ? (
        <>
          {tabs.map((tab) => (
            <iframe
              key={tab.url}
              ref={tab.url === activeTab ? iframeRef : null}
              style={{ flex: 1, border: "none" }}
              src={tab.url}
              className={tab.url === activeTab ? "d-block" : "d-none"}
            />
          ))}
        </>
      ) : (
        <IdePlaceholder
          onLaunch={() => addTab(config.vscodeEndpoint, "Workspace")}
          vscodeUrl={config.vscodeEndpoint}
        />
      )}
    </div>
  );
}
