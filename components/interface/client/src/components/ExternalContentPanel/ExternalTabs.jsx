import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

export function ExternalTabs({
  activeTab,
  setActiveTab,
  tabs,
  onTabRemoval,
  onRefreshClick,
}) {
  return (
<>
    {tabs.length > 1 && (
    <Nav
      variant="tabs"
      activeKey={activeTab}
      onSelect={(selectedKey) => setActiveTab(selectedKey)}
      id="external-content-tabs"
      className="align-items-end"
    >
      {tabs.map((tab) => (
        <Nav.Item key={tab.url} className="me-2 ms-2">
          <Nav.Link
            eventKey={tab.url}
            href={tab.url}
            className="p-1 ps-3 pe-1"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <span className="me-3">{tab.title}</span>

            {activeTab === tab.url && (
              <Button
                size="sm"
                variant="default"
                className="rounded-circle p-1 pt-0 pb-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRefreshClick();
                }}
              >
                <span className="material-symbols-outlined">refresh</span>
              </Button>
            )}

            {tab.title !== "Workspace" && (
              <Button
                size="sm"
                variant="default"
                className="rounded-circle p-1 pt-0 pb-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onTabRemoval(tab.url);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </Button>
            )}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>

    )}
    </>
  );
}
