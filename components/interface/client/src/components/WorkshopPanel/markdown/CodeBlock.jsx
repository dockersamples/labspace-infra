import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Button from "react-bootstrap/Button";
import copy from "copy-to-clipboard";
import { useCallback, useEffect, useState } from "react";
import { useRunCommand } from "../../../WorkshopContext";

export function CodeBlock({ node, inline, className, children, ...props }) {
  const runCommand = useRunCommand();
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [errorRunning, setErrorRunning] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  let language = match ? match[1] : "text";
  if (language === "sh" || language === "console") language = "bash";

  const codeIndex = node.properties.dataCodeIndex;
  const canRun = codeIndex !== undefined && language === "bash";

  const onCopyClick = useCallback(() => {
    copy(children);
    setCopied(true);
  }, [setCopied, children]);

  const onRunClick = useCallback(() => {
    setRunning(true);
    runCommand(codeIndex)
      .catch(() => setErrorRunning(true))
      .finally(() => setRunning(false));
  }, [setRunning, setErrorRunning, codeIndex]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied, setCopied]);

  useEffect(() => {
    if (errorRunning) {
      const timer = setTimeout(() => setErrorRunning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [errorRunning, setErrorRunning]);

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
      <div className="button-container pt-1 bg-light align-self-stretch d-flex align-items-center">
        <Button
          className="m-2"
          variant="secondary"
          size="sm"
          onClick={onCopyClick}
        >
          {copied ? "Copied!" : "📋"}
        </Button>
        {canRun && (
          <Button
            className="m-2"
            variant="secondary"
            size="sm"
            onClick={onRunClick}
          >
            {running ? "Running" : errorRunning ? "❌ Error" : "▶️"}
          </Button>
        )}
      </div>
    </div>
  );
}
