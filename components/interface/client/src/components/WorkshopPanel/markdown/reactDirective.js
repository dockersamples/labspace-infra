import { visit } from "unist-util-visit";

/**
 * Works with the remark-directive plugin to transform custom directives into
 * components that can be used by react-markdown.
 *
 * To support a custom directive, simply define the React component and add it
 * to the components prop of MarkdownRenderer. The name of the component must
 * match the name of the directive.
 *
 * @returns
 */
export function tabDirective() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return (tree) => {
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      (node) => {
        const data = node.data || (node.data = {});

        if (!isNaN(Number(node.name))) {
          node.children = [{ type: "text", value: `:${node.name}` }];
          node.name = node.type === "textDirective" ? "span" : "div";
          hastify(node, {});
          return;
        }

        // This is what's supposed to work. But "h" was not a function?
        // const { properties } = h(node.name, node.attributes);

        data.hName = node.name;
        data.hProperties = {
          ...node.attributes,
        };
      },
    );
  };
}

function hastify(directive, extra) {
  const { attributes, data, name } = directive;
  directive.data = data || {};
  directive.data.hName = name;
  directive.data.hProperties = { ...attributes, ...extra };
}
