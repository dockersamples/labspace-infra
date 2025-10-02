import { createContext, useCallback, useContext, useState } from "react";

const TabContext = createContext([]);

export function TabContextProvider({ children }) {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const addTab = useCallback(
    (url, title) => {
      if (!title) title = url;
      setTabs((prevTabs) => [...prevTabs, { url, title }]);
      setActiveTab(url);
    },
    [setTabs, setActiveTab],
  );

  const removeTab = useCallback(
    (url) => {
      setTabs((prevTabs) => {
        const updatedTabs = prevTabs.filter((tab) => tab.url !== url);

        setActiveTab((prevActiveTab) => {
          if (prevActiveTab === url) {
            const tabIndex = prevTabs.findIndex((tab) => tab.url === url);
            if (updatedTabs.length > 0) {
              const newIndex =
                tabIndex === 0 ? 0 : Math.min(tabIndex - 1, updatedTabs.length - 1);
              return updatedTabs[newIndex].url;
            } else {
              return null;
            }
          }
          return prevActiveTab;
        });

        return updatedTabs;
      });
    },
    [setTabs, setActiveTab],
  );

  const displayLink = useCallback(
    (url, title) => {
      if (!title) title = url;

      setTabs((prevTabs) => {
        if (!prevTabs.find((tab) => tab.url === url)) {
          return [...prevTabs, { url, title }];
        }
        return prevTabs;
      });
      setActiveTab(url);
    },
    [setTabs, setActiveTab],
  );

  return (
    <TabContext.Provider
      value={{ tabs, addTab, removeTab, activeTab, setActiveTab, displayLink }}
    >
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => useContext(TabContext);
