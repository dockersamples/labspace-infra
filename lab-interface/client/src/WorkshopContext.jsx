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

  const changeActiveSection = useCallback(
    (sectionId) => {
      fetch(`/api/sections/${sectionId}`)
        .then((response) => {
          if (!response.ok) throw new Error("Section not found");
          return response.json();
        })
        .then((section) => {
          setActiveSection(section);
        })
        .catch((error) => {
          console.error("Error fetching section data:", error);
          // Fallback to default section if fetch fails
          setActiveSection({});
          toast.error(
            "Failed to load section details. Validate the Labspace is running and try again.",
          );
        });
    },
    [setActiveSection],
  );

  useEffect(() => {
    fetch("/api/labspace")
      .then((response) => response.json())
      .then((data) => {
        setWorkshop(data);
        changeActiveSection(data.sections[0].id); // Set the first section as active by default
      })
      .catch((error) => {
        console.error("Error fetching workshop data:", error);
        toast.error(
          "Failed to load workshop data. Validate the Labspace is running and refresh the page.",
          {
            autoClose: false,
            onClick: () => window.location.reload(),
          },
        );
      });
  }, [changeActiveSection]);

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
      value={{ workshop, activeSection, changeActiveSection }}
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
