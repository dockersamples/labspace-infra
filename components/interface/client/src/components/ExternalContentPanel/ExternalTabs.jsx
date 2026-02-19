import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

export function ExternalTabs({
  activeTab,
  setActiveTab,
  tabs,
  onRefreshClick,
}) {
  return (
    <>
      {tabs.length > 1 && (
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(selectedKey) => setActiveTab(selectedKey)}
          id="external-content-tabs"
          className="align-items-end"
        >
          {tabs.map((tab) => (
            <Nav.Item key={tab.id} className="me-2 ms-2">
              <Nav.Link
                eventKey={tab.id}
                href={tab.url}
                className={`p-0 ps-3 pe-3 rounded-top d-flex align-items-center text-white ` + (activeTab === tab.id ? "bg-primary" : "")}
                style={{ fontSize: "0.7rem" }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <span className="app-icon material-symbols-outlined me-2">
                  {tab.icon}
                </span>
                <span>{tab.title}</span>

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
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      )}
    </>
  );
  
}
