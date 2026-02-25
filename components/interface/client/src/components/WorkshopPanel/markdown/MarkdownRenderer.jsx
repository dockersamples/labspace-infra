import { MarkdownHooks } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeMermaid from "rehype-mermaid";
import remarkDirective from "remark-directive";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import { CodeBlock } from "./CodeBlock";
import { remarkCodeIndexer } from "./codeIndexer";
import { ExternalLink } from "./ExternalLink";
import { RenderedImage } from "./RenderedImage";
import { RenderedSvg } from "./RenderedSvg";
import { tabDirective } from "./reactDirective";
import { TabLink } from "./TabLink";
import { FileLink } from "./FileLink";
import { VariableDefinition } from "./VariableDefinition";
import { VariableSetButton } from "./VariableSetButton";

export function MarkdownRenderer({ children }) {
  return (
    <MarkdownHooks
      remarkPlugins={[
        remarkGfm,
        remarkCodeIndexer,
        remarkDirective,
        tabDirective,
      ]}
      rehypePlugins={[rehypeRaw, rehypeMermaid, rehypeGithubAlerts]}
      components={{
        code: CodeBlock,
        a: ExternalLink,
        img: RenderedImage,
        svg: RenderedSvg,
        tablink: TabLink,
        filelink: FileLink,
        variabledefinition: VariableDefinition,
        variablesetbutton: VariableSetButton,
      }}
    >
      {children}
    </MarkdownHooks>
  );
}
