import React, { createContext, useContext } from "react";
import { useAppController } from "@controllers/useAppController";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const controller = useAppController();

  return (
    <AppContext.Provider value={controller}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
