import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { createContext } from "react";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) {
    return null;
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
