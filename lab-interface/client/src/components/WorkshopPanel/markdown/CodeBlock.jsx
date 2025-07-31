import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Button from "react-bootstrap/Button";
import copy from "copy-to-clipboard";
import { useCallback, useEffect, useState } from "react";

console.log("Supported languages:", SyntaxHighlighter.supportedLanguages);

export function CodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);

  const onCopyClick = useCallback(() => {
    copy(children);
    setCopied(true);
  }, [setCopied, children]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const match = /language-(\w+)/.exec(className || "");
  let language = match ? match[1] : "text";
  if (language === "sh" || language === "console") language = "bash";

  if (!match || inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="position-relative">
      <SyntaxHighlighter
        style={darcula}
        language={language}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <div className="copy-button-container">
        <Button
          className="position-absolute top-0 end-0 m-2"
          variant="secondary"
          size="sm"
          onClick={onCopyClick}
        >
          {copied ? "Copied!" : "📋 Copy"}
        </Button>
      </div>
    </div>
  );
}
