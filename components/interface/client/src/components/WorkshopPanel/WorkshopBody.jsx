import { useActiveSection, useWorkshop } from "../../WorkshopContext";
import { useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import { MarkdownRenderer } from "./markdown/MarkdownRenderer";

export function WorkshopBody() {
  const bodyRef = useRef();
  const { activeSection, changeActiveSection } = useActiveSection();
  const { sections } = useWorkshop();

  const index = sections.findIndex(
    (section) => section.id === activeSection.id,
  );

  useEffect(() => {
    // alert("Scrolling?");
    window.bodyRef = bodyRef.current;
    setTimeout(
      () => bodyRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
      100,
    );
  }, [activeSection, bodyRef]);

  const hasNext = index < sections.length - 1;
  const hasPrev = index > 0;

  return (
    <>
      <div className="overflow-auto" ref={bodyRef}>
        <div className="workshop-body p-5 pt-3 pb-3">
          <MarkdownRenderer>{activeSection.content}</MarkdownRenderer>
        </div>
        <div className="workshop-footer d-flex justify-content-between p-3 border-top">
          <div>
            {hasPrev && (
              <Button
                variant="secondary"
                onClick={() => changeActiveSection(sections[index - 1].id)}
                className="d-flex align-items-center"
              >
                <span className="material-symbols-outlined me-1">
                  arrow_back
                </span>
                <span>Previous</span>
              </Button>
            )}
          </div>
          <div>
            {hasNext && (
              <Button
                variant="primary"
                onClick={() => changeActiveSection(sections[index + 1].id)}
                className="d-flex align-items-center"
              >
                <span className="me-1">Next</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
