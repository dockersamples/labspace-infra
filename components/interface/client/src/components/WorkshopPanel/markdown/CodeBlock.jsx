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

export function CodeBlock({ node, inline, className, children, ...props }) {
  const { activeSection } = useActiveSection();
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

  const onCopyClick = useCallback(() => {
    copy(children);
    return Promise.resolve();
  }, [children]);

  // This needs `children` as ReactMarkdown seems to re-use the component instance
  const onRunClick = useCallback(() => {
    return runCommand(activeSection.id, codeIndex);
  }, [codeIndex, activeSection]);

  // This needs `children` as ReactMarkdown seems to re-use the component instance
  const onSaveAsClick = useCallback(() => {
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
      className="position-relative code-block d-flex align-items-center"
      style={{ background: "rgb(43, 43, 43)" }}
    >
      <SyntaxHighlighter
        style={darcula}
        language={language}
        PreTag="div"
        className="me-auto bg-none"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <div className="button-container pt-1  bg-light-subtle align-self-stretch d-flex align-items-center">
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
