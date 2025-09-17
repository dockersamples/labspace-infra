import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import { CodeBlock } from "./CodeBlock";
import { remarkCodeIndexer } from "./codeIndexer";
import { ExternalLink } from "./ExternalLink";
import { RenderedImage } from "./RenderedImage";
import { RenderedSvg } from "./RenderedSvg";

export function MarkdownRenderer({ children }) {
  return (
    <MarkdownHooks
      remarkPlugins={[remarkGfm, remarkCodeIndexer]}
      rehypePlugins={[rehypeRaw, rehypeMermaid, rehypeGithubAlerts]}
      components={{
        code: CodeBlock,
        a: ExternalLink,
        img: RenderedImage,
        svg: RenderedSvg,
      }}
    >
      {children}
    </MarkdownHooks>
  );
}
