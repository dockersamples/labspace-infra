import { useActiveSection, useWorkshop } from "../../WorkshopContext";
import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import { CodeBlock } from "./markdown/CodeBlock";
import { remarkCodeIndexer } from "./markdown/codeIndexer";
import { useEffect, useRef } from "react";
import { ExternalLink } from "./markdown/ExternalLink";

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
          <MarkdownHooks
            remarkPlugins={[remarkGfm, remarkCodeIndexer]}
            rehypePlugins={[rehypeRaw, rehypeMermaid, rehypeGithubAlerts]}
            components={{
              code: CodeBlock,
              a: ExternalLink,
            }}
          >
            {activeSection.content}
          </MarkdownHooks>
        </div>
        <div className="workshop-footer d-flex justify-content-between p-3 border-top">
          <div>
            {hasPrev && (
              <button
                className="btn btn-secondary"
                onClick={() => changeActiveSection(sections[index - 1].id)}
              >
                &larr; Previous
              </button>
            )}
          </div>
          <div>
            {hasNext && (
              <button
                className="btn btn-primary"
                onClick={() => changeActiveSection(sections[index + 1].id)}
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
