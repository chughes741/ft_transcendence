import React, { createContext } from "react";
import { SettingsModelType, useSettingsModel } from "./settings.model";

export interface SettingsViewModelType extends SettingsModelType {
  handleOpen: () => void;
  handleClose: () => void;
}

export const SettingsViewModelContext: React.Context<SettingsViewModelType | null> =
  createContext<SettingsViewModelType | null>(null);

export const SettingsViewModelProvider = ({ children }) => {
  const { open, setOpen } = useSettingsModel();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <SettingsViewModelContext.Provider
      value={{
        open,
        setOpen,
        handleOpen,
        handleClose
      }}
    >
      {children}
    </SettingsViewModelContext.Provider>
  );
};

export const useSettingsViewModel = (): SettingsViewModelType => {
  const context = React.useContext(SettingsViewModelContext);
  if (context === null) {
    throw new Error(
      "useSettingsViewModel must be used within a SettingsViewModelProvider"
    );
  }
  return context;
};
