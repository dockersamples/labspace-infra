import { useTabs } from "../../TabContext";
import "./ExternalContentPanel.scss";
import { ExternalTabs } from "./ExternalTabs";
import { useRef } from "react";

export function ExternalContentPanel() {
  const { tabs, setActiveTab, activeTab, addTab, removeTab } = useTabs();
  const iframeRef = useRef();

  return (
    <div className="d-flex flex-fill flex-column">
      {tabs.length > 1 && (
        <div
          className="p-2 bg-dark border-bottom border-light-subtle"
          id="service-selector"
        >
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
      )}

      {tabs.map((tab) => (
        <iframe
          key={tab.url}
          ref={tab.id === activeTab ? iframeRef : null}
          style={{ flex: 1, border: "none" }}
          src={tab.url}
          className={tab.id === activeTab ? "d-block" : "d-none"}
        />
      ))}
    </div>
  );
}
