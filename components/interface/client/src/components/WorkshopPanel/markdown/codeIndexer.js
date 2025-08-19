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
      
      if (node.meta && node.meta.indexOf("no-run-button") > -1)
        return;

      node.data = node.data || {};
      node.data.codeIndex = codeIndex;
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        "data-code-index": codeIndex,
      };
    });
  };
}
