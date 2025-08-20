import {
  useCallback,
  useEffect,
  useContext,
  createContext,
  useState,
} from "react";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";

const WorkshopContext = createContext();

export const WorkshopContextProvider = ({ children }) => {
  const [workshop, setWorkshop] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const changeActiveSection = useCallback(
    (sectionId) => {
      console.log("Changing active section to:", sectionId);
      setActiveSectionId(sectionId);
    },
    [setActiveSectionId],
  );

  useEffect(() => {
    if (!workshop) return;
    if (workshop.devMode) {
      const interval = setInterval(() => setRefreshCounter((c) => c + 1), 2000);
      return () => clearInterval(interval);
    }
  }, [workshop, setRefreshCounter]);

  useEffect(() => {
    if (!activeSectionId) return;

    console.log("Fetching section data for ID:", activeSectionId);
    fetch(`/api/sections/${activeSectionId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Section not found");
        return response.json();
      })
      .then((section) => {
        toast.dismiss("section-load-error");
        setActiveSection((s) =>
          JSON.stringify(s) === JSON.stringify(section) ? s : section,
        );
      })
      .catch((error) => {
        console.error("Error fetching section data:", error);
        // Fallback to default section if fetch fails
        setActiveSection({});
        toast.error(
          "Failed to load section details. Validate the Labspace is running and try again.",
          {
            toastId: "section-load-error",
            autoClose: false,
          },
        );
      });
  }, [activeSectionId, setActiveSection, refreshCounter]);

  const runCommand = useCallback(
    (codeBlockIndex) => {
      return fetch(`/api/sections/${activeSection.id}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codeBlockIndex }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to run command");
          return response.json();
        })
        .then((result) => {
          console.log("Command result:", result);
        })
        .catch((error) => {
          console.error("Error running command:", error);
          toast.error("Failed to run command. Please try again.");
        });
    },
    [activeSection],
  );

  useEffect(() => {
    if (!workshop) return;
    document.title = `${workshop.title} ${activeSection ? `- ${activeSection.title}` : ""}`;
  }, [workshop, activeSection]);

  useEffect(() => {
    fetch("/api/labspace")
      .then((response) => response.json())
      .then((data) => {
        setWorkshop(data);
        toast.dismiss("workshop-load-error");
      })
      .catch((error) => {
        console.error("Error fetching workshop data:", error);
        toast.error(
          "Failed to load workshop data. Validate the Labspace is running and refresh the page.",
          {
            toastId: "workshop-load-error",
            autoClose: false,
            onClick: () => window.location.reload(),
          },
        );
      });
  }, [changeActiveSection, refreshCounter]);

  useEffect(() => {
    setActiveSectionId((id) => id || workshop?.sections?.[0]?.id);
  }, [workshop, setActiveSectionId]);

  if (!workshop || !activeSection) {
    return (
      <div className="loading text-center mt-5 w-100">
        <Spinner />
        <p>Loading Labspace data...</p>
      </div>
    );
  }

  return (
    <WorkshopContext.Provider
      value={{ workshop, activeSection, changeActiveSection, runCommand }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => useContext(WorkshopContext).workshop;

export const useActiveSection = () => {
  const { activeSection, changeActiveSection } = useContext(WorkshopContext);
  return { activeSection, changeActiveSection };
};

export const useRunCommand = () => {
  const { runCommand } = useContext(WorkshopContext);
  return runCommand;
};
