import { visit } from "unist-util-visit";

/**
 * A Remark plugin that adds a data-code-index attribute to code blocks, making
 * it possible to enable the "Run" button (which requires the code block index).
 * @returns
 */
export function remarkCodeIndexer() {
  return (tree) => {
    let i = 0;
    visit(tree, "code", (node) => {
      const codeIndex = i++;

      node.data = node.data || {};
      node.data.codeIndex = codeIndex;
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        "data-code-index": codeIndex,
      };

      const codeBlockMeta = (node.meta || "").split(/\s+/);

      node.data.hProperties["data-display-run-button"] = codeBlockMeta.includes(
        "no-run-button",
      )
        ? "false"
        : "true";
      node.data.hProperties["data-display-copy-button"] =
        codeBlockMeta.includes("no-copy-button") ? "false" : "true";
      node.data.hProperties["data-display-save-as-button"] = codeBlockMeta.find(
        (m) => m.startsWith("save-as"),
      )
        ? "true"
        : "false";
    });
  };
}
