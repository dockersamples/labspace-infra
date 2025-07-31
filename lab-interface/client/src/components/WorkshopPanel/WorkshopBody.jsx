import { useActiveSection } from "../../WorkshopContext";
import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import { CodeBlock } from "./markdown/CodeBlock";

export function WorkshopBody() {
  const { activeSection } = useActiveSection();

  return (
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
  );
}
