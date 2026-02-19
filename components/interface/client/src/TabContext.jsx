import { createContext, useCallback, useContext, useState } from "react";
import { useWorkshop } from "./WorkshopContext";

const TabContext = createContext([]);

export function TabContextProvider({ children }) {
  const workshop = useWorkshop();
  const [customTabs, setCustomTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("ide");

  const addTab = useCallback(
    (url, title, id) => {
      if (!title) title = url;
      if (!id) id = title;
      setCustomTabs((prevTabs) => [...prevTabs, { url, title, id }]);
      setActiveTab(id);
    },
    [setCustomTabs, setActiveTab],
  );

  const removeTab = useCallback(
    (id) => {
      setCustomTabs((prevTabs) => {
        const updatedTabs = prevTabs.filter((tab) => tab.id !== id);

        setActiveTab((prevActiveTab) => {
          if (prevActiveTab === id) {
            const tabIndex = prevTabs.findIndex((tab) => tab.id === id);
            if (updatedTabs.length > 0) {
              const newIndex =
                tabIndex === 0
                  ? 0
                  : Math.min(tabIndex - 1, updatedTabs.length - 1);
              return updatedTabs[newIndex].id;
            } else {
              return null;
            }
          }
          return prevActiveTab;
        });

        return updatedTabs;
      });
    },
    [setCustomTabs, setActiveTab],
  );

  const displayLink = useCallback(
    (url, title, id, icon) => {
      if (!title) title = url;
      if (!id) id = title;

      if (workshop.services && workshop.services.find((s) => s.id === id)) {
        workshop.services.find((s) => s.id === id).url = url;
        setActiveTab(id);
        return;
      }

      setCustomTabs((prevTabs) => {
        const existingTab = prevTabs.find((tab) => tab.id === id);
        if (existingTab) {
          existingTab.url = url;
          return prevTabs;
        }

        return [...prevTabs, { url, title, id, icon }];
      });
      setActiveTab(id);
    },
    [workshop.services, setCustomTabs, setActiveTab],
  );

  const tabs = [
    {
      id: "ide",
      url: "http://localhost:8085",
      icon: "code",
      title: "IDE",
    },
    ...(workshop.services || []),
    ...customTabs,
  ];

  return (
    <TabContext.Provider
      value={{ tabs, addTab, removeTab, activeTab, setActiveTab, displayLink }}
    >
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => useContext(TabContext);
