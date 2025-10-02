import { useOpenFile } from "../../../WorkshopContext";

export function FileLink({ path, line, children }) {
  const openFile = useOpenFile();

  const lineAsNumber = line ? parseInt(line, 10) : undefined;

  return (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        openFile(path, lineAsNumber);
      }}
    >
      {children}
    </a>
  );
}
