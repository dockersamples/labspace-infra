import { useActiveSection } from "../../WorkshopContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./markdown/CodeBlock";

export function WorkshopBody() {
  const { activeSection } = useActiveSection();

  return (
    <div className="workshop-body p-5 pt-3 pb-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock,
        }}
      >
        {activeSection.content}
      </ReactMarkdown>
    </div>
  );
}
