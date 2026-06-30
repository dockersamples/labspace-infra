import { createContext, useContext } from "react";

const PrintModeContext = createContext(false);

export const PrintModeProvider = ({ children }) => (
  <PrintModeContext.Provider value={true}>{children}</PrintModeContext.Provider>
);

export const usePrintMode = () => useContext(PrintModeContext);
