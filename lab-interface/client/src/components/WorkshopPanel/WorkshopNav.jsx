import Dropdown from "react-bootstrap/Dropdown";
import { useActiveSection, useWorkshop } from "../../WorkshopContext";

export function WorkshopNav() {
  const { sections } = useWorkshop();
  const { activeSection, changeActiveSection } = useActiveSection();

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
