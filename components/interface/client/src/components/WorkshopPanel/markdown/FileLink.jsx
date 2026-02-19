import { useTabs } from "../../../TabContext";
import { useOpenFile } from "../../../WorkshopContext";

export function FileLink({ path, line, children }) {
  const openFile = useOpenFile();
  const { setActiveTab } = useTabs();

  const lineAsNumber = line ? parseInt(line, 10) : undefined;

  return (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        setActiveTab("ide");
        openFile(path, lineAsNumber);
      }}
    >
      {children}
    </a>
  );
}
