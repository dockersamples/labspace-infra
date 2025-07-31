import { useActiveSection, useWorkshop } from "../../WorkshopContext";
import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import { CodeBlock } from "./markdown/CodeBlock";

export function WorkshopBody() {
  const { activeSection, changeActiveSection } = useActiveSection();
  const { sections } = useWorkshop();

  const index = sections.findIndex(
    (section) => section.id === activeSection.id,
  );

  const hasNext = index < sections.length - 1;
  const hasPrev = index > 0;

  return (
    <>
      <div className="workshop-body p-5 pt-3 pb-3">
        <MarkdownHooks
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeMermaid]}
          components={{
            code: CodeBlock,
          }}
        >
          {activeSection.content}
        </MarkdownHooks>
      </div>

      <div className="workshop-footer d-flex justify-content-between p-3 bg-light border-top">
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
              &rarr; Next
            </button>
          )}
        </div>
      </div>
    </>
  );
}
