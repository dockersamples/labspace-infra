import { createContext, use, useCallback, useContext, useState } from "react";

const TabContext = createContext([]);

export function TabContextProvider({ children }) {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState(null);

    const addTab = useCallback((url) => {
        setTabs((prevTabs) => [...prevTabs, url]);
        setActiveTab(url);
    }, [setTabs, setActiveTab]);

    const removeTab = useCallback((url) => {
        setTabs((prevTabs) => prevTabs.filter((tab) => tab !== url));
        setActiveTab((prevActiveTab) => (prevActiveTab === url ? null : prevActiveTab));
    }, [setTabs, setActiveTab]);

    const displayLink = useCallback((url) => {
        setTabs((prevTabs) => {
            if (!prevTabs.includes(url)) {
                return [...prevTabs, url];
            }
            return prevTabs;
        });
        setActiveTab(url);
    }, [setTabs, setActiveTab]);

    return (
        <TabContext.Provider value={{ tabs, addTab, removeTab, activeTab, setActiveTab, displayLink }}>
            {children}
        </TabContext.Provider>
    );
}

export const useTabs = () => useContext(TabContext);