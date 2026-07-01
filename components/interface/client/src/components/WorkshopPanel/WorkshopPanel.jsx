import { useActiveSection, useWorkshop } from "../../WorkshopContext";
import Button from "react-bootstrap/Button";
import { MarkdownRenderer } from "./markdown/MarkdownRenderer";
import { WorkshopNav } from "./WorkshopNav";
import "./WorkshopPanel.scss";

export function WorkshopPanel() {
  const { activeSection, changeActiveSection } = useActiveSection();
  const { sections } = useWorkshop();

  const index = sections.findIndex(
    (section) => section.id === activeSection.id,
  );

  const hasNext = index < sections.length - 1;
  const hasPrev = index > 0;

  return (
    <div className="d-flex flex-column h-100">
      <div className="overflow-auto flex-grow-1">
        <div className="workshop-body p-5 pt-3 pb-3">
          <MarkdownRenderer key={`section-${activeSection.id}`}>
            {activeSection.content}
          </MarkdownRenderer>
        </div>
      </div>

      <div
        id="workshop-footer"
        style={{ borderColor: "#E5E5E5 !Important" }}
        className="workshop-footer d-flex justify-content-between p-3 border-top bg-light-subtle align-items-center"
      >
        <div>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => changeActiveSection(sections[index - 1].id)}
            className="d-flex align-items-center"
            style={{ visibility: hasPrev ? "visible" : "hidden" }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Previous</span>
          </Button>
        </div>
        <div style={{ maxWidth: "calc(100% - 175px)" }}>
          <WorkshopNav />
        </div>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => changeActiveSection(sections[index + 1].id)}
            className="d-flex align-items-center"
            style={{ visibility: hasNext ? "visible" : "hidden" }}
          >
            <span className="me-1">Next</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
