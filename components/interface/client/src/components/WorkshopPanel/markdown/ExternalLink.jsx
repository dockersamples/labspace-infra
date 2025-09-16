import { useTabs } from "../../../TabContext";

export function ExternalLink({ href, children, ...rest }) {
  const { displayLink } = useTabs();

  const handleClick = (e) => {
    e.preventDefault();
    displayLink(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
