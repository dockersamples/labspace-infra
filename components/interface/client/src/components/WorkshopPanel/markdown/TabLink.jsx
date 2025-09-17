import { useTabs } from "../../../TabContext";

export function TabLink({ href, title, children }) {
  const { displayLink } = useTabs();

  return (
    <a
      href={href}
      title={title}
      onClick={(e) => {
        e.preventDefault();
        displayLink(href, title);
      }}
    >
      {children}
    </a>
  );
}
