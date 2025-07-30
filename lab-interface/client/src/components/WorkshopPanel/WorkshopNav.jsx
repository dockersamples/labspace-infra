import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { useActiveSection, useWorkshop } from "../../WorkshopContext";

export function WorkshopNav() {
  const { sections } = useWorkshop();
  const { activeSection, changeActiveSection } = useActiveSection();

  if (sections.length > 3) {
    return (
      <div className="workshop-nav">
        <Dropdown align="end">
          <Dropdown.Toggle variant="secondary" size="sm">
            {(activeSection && (
              <>
                {sections.findIndex((s) => s.id === activeSection.id) + 1}.{" "}
                {activeSection.title}
              </>
            )) ||
              "Sections"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {sections.map((section, index) => (
              <Dropdown.Item
                key={section.id}
                active={activeSection?.id === section.id}
                onClick={() => changeActiveSection(section.id)}
              >
                {index + 1}. {section.title}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="workshop-nav">
      <div
        className="nav-tabs p-4 pt-3 pb-3"
        style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
      >
        {sections.map((section) => (
          <Button
            key={section.title}
            size="sm"
            variant={
              activeSection?.id === section.id ? "primary" : "outline-secondary"
            }
            className={`nav-tab me-2`}
            active={activeSection?.id === section.id}
            onClick={() => {
              changeActiveSection(section.id);
            }}
          >
            {section.title}
          </Button>
        ))}
      </div>
    </div>
  );
}
