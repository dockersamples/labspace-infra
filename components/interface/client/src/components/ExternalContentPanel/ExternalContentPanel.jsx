import { IdePlaceholder } from "./IdePlaceholder";
import { useTabs } from "../../TabContext";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import "./ExternalContentPanel.scss";

function getTabTitle(url) {
  if (url === "http://localhost:8085")
    return "VS Code";
  return url;
}

export function ExternalContentPanel() {
  const { tabs, setActiveTab, activeTab, addTab, removeTab } = useTabs();

  return (
    <div className="d-flex flex-fill flex-column">
      <div className="p-3 pt-2 pb-0 bg-secondary-subtle">
        <Nav
          variant="tabs" 
          activeKey={activeTab}
          onSelect={(selectedKey) => setActiveTab(selectedKey)}
          id="external-content-tabs"
        >
          {tabs.map((tab) => (
            <Nav.Item key={tab} className="me-2 ms-2">
              <Nav.Link eventKey={tab} className="p-1 ps-3 pe-1">
                <span className="me-3">
                  { getTabTitle(tab) }
                </span>

                { !tab.endsWith("localhost:8085") && (
                  <Button 
                    size="sm"
                    variant="default"
                    className="rounded-circle p-1 pt-0 pb-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab);
                    }}
                  >&times;</Button>
                )}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>
      { activeTab ? (
        <iframe
          style={{ flex: 1, border: "none" }}
          src={activeTab}
        />
      ) : (
        <IdePlaceholder onLaunch={() => addTab("http://localhost:8085")} />
      )}
    </div>
  );
}
