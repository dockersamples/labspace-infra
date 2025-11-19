import Dropdown from "react-bootstrap/Dropdown";
import { useActiveSection, useWorkshop } from "../../WorkshopContext";
import "./WorkshopNav.scss";

export function WorkshopNav() {
  const { sections } = useWorkshop();
  const { activeSection, changeActiveSection } = useActiveSection();

  return (
    <div className="workshop-nav">
      <Dropdown className="dropdown-center" drop="down-centered">
        <Dropdown.Toggle
          variant="outline-secondary"
          className="text-truncate w-100"
          size="sm"
          id="labspace-nav-dropdown"
        >
          {(activeSection && (
            <>
              {sections.findIndex((s) => s.id === activeSection.id) + 1}.{" "}
              {activeSection.title}
            </>
          )) ||
            "Sections"}
        </Dropdown.Toggle>

        <Dropdown.Menu align="center">
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
