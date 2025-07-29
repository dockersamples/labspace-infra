import { useEffect } from "react";
import { useContext, createContext, useState } from "react";

const DEFAULT = {
  activeSection: {
    id: "getting-started",
    title: "Getting Started",
    description:
      "This section covers the basics of Docker, including installation and setup.",
    content:
      "Welcome to the Getting Started section! \n\nHere, you'll learn how to **install Docker**, set up your _environment_, and run your first container. This is the foundation for everything else you'll do in this workshop.",
  },
  changeActiveSection: () => {},
  workshop: {
    title: "Demo Labspace",
    subtitle: "Interactive hands-on Docker learning experience",
    sections: [
      {
        id: "getting-started",
        title: "Getting Started",
        description:
          "This section covers the basics of Docker, including installation and setup.",
        content:
          "Welcome to the Getting Started section! \n\nHere, you'll learn how to **install Docker**, set up your _environment_, and run your first container. This is the foundation for everything else you'll do in this workshop.",
      },
      {
        id: "containers",
        title: "Containers",
        description:
          "Learn about Docker containers, how to create and manage them.",
      },
      {
        id: "images-builds",
        title: "Images & Builds",
        description: "Understand Docker images, how to build and manage them.",
      },
      {
        id: "multi-container",
        title: "Multi-Container",
        description:
          "Explore multi-container applications using Docker Compose.",
      },
      {
        id: "agentic-compose",
        title: "Agentic Compose",
        description:
          "Learn about advanced features in Docker Compose for complex applications.",
      },
      {
        id: "advanced",
        title: "Advanced",
        description: "Dive into advanced Docker topics and best practices.",
      },
    ],
  },
};

const WorkshopContext = createContext();

export const WorkshopContextProvider = ({ children }) => {
  const [workshop, setWorkshop] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const changeActiveSection = (sectionId) => {
    const section = workshop.sections.find((s) => s.id === sectionId);
    if (section) {
      setActiveSection(section);
    } else {
      console.warn(`Section with id ${sectionId} not found.`);
    }
  };

  useEffect(() => {
    fetch("/api/labspace")
      .then((response) => response.json())
      .then((data) => {
        setWorkshop(data);
        setActiveSection(data.sections[0]); // Set the first section as active by default
      })
      .catch((error) => {
        console.error("Error fetching workshop data:", error);
        setWorkshop(DEFAULT.workshop);
        setActiveSection(DEFAULT.activeSection);
      });
  }, []);

  if (!workshop) {
    return (
      <div className="loading">
        <p>Loading workshop data...</p>
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
