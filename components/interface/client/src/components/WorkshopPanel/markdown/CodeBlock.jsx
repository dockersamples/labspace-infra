import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";

import copy from "copy-to-clipboard";
import { useCallback } from "react";
import {
  useActiveSection,
  useRunCommand,
  useSaveFileCommand,
} from "../../../WorkshopContext";
import { CodeBlockAction } from "./CodeBlockAction";
import { useTabs } from "../../../TabContext";

export function CodeBlock({ node, inline, className, children, ...props }) {
  const { activeSection } = useActiveSection();
  const { setActiveTab } = useTabs();
  const runCommand = useRunCommand();
  const saveFileCommand = useSaveFileCommand();

  const match = /language-(\w+)/.exec(className || "");
  let language = match ? match[1] : "text";
  if (language === "sh" || language === "console") language = "bash";

  // These properties are populated by the codeIndexer remark plugin
  const codeIndex = node.properties.dataCodeIndex;
  const canRun =
    node.properties.dataDisplayRunButton === "true" && language === "bash";
  const canCopy = node.properties.dataDisplayCopyButton === "true";
  const canSaveAsFile = node.properties.dataDisplaySaveAsButton === "true";
  const highlightLines = node.properties.dataHighlightLines
    ? node.properties.dataHighlightLines.split(",").flatMap((s) => {
        const trimmed = s.trim();
        if (trimmed.includes("-")) {
          const [start, end] = trimmed.split("-").map((n) => parseInt(n, 10));
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return parseInt(trimmed, 10);
      })
    : [];

  const onCopyClick = useCallback(() => {
    copy(children);
    return Promise.resolve();
  }, [children]);

  // This needs `children` as ReactMarkdown seems to re-use the component instance
  const onRunClick = useCallback(() => {
    setActiveTab("ide");
    return runCommand(activeSection.id, codeIndex);
  }, [codeIndex, activeSection]);

  // This needs `children` as ReactMarkdown seems to re-use the component instance
  const onSaveAsClick = useCallback(() => {
    setActiveTab("ide");
    return saveFileCommand(activeSection.id, codeIndex);
  }, [codeIndex, activeSection]);

  if (!match || inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div
      className="position-relative rounded code-block d-flex align-items-center"
      style={{ background: "rgb(43, 43, 43)" }}
    >
      <SyntaxHighlighter
        style={darcula}
        language={language}
        PreTag="div"
        className="flex-grow-1 bg-none"
        wrapLines={highlightLines.length > 0}
        showLineNumbers={highlightLines.length > 0}
        lineNumberStyle={{ display: "none" }}
        lineProps={(lineNumber) => {
          const lineProps = {
            className: "d-block",
          };

          if (highlightLines.includes(lineNumber))
            lineProps.className += " highlight-line"; // Highlight the first line (lineNumber is 1-indexed)

          return lineProps;
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <div className="button-container align-self-stretch d-flex align-items-center">
        {canCopy && (
          <CodeBlockAction
            icon="content_copy"
            onClick={onCopyClick}
            completedText="Copied!"
            tooltip="Copy to clipboard"
          />
        )}
        {canRun && (
          <CodeBlockAction
            icon="play_circle"
            onClick={onRunClick}
            tooltip="Run code"
          />
        )}

        {canSaveAsFile && (
          <CodeBlockAction
            icon="save"
            onClick={onSaveAsClick}
            completedText="Saved!"
            tooltip="Save file"
          />
        )}
      </div>
    </div>
  );
}
