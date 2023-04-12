import React, { createContext } from "react";
import { SettingsModelType, useSettingsModel } from "./settings.model";

/**
 * SettingsViewModelType
 *
 * @interface SettingsViewModelType
 * @extends {SettingsModelType}
 */
export interface SettingsViewModelType extends SettingsModelType {
  handleOpenSettings: () => void;
  handleCloseSettings: () => void;
}

/**
 * SettingsViewModelContext
 *
 * @type {React.Context<SettingsViewModelType | null>}
 */
export const SettingsViewModelContext: React.Context<SettingsViewModelType | null> =
  createContext<SettingsViewModelType | null>(null);

/**
 * SettingsViewModelProvider
 *
 * @returns {JSX.Element}
 */
export const SettingsViewModelProvider = ({ children }) => {
  const { open, setOpen } = useSettingsModel();

  const handleOpenSettings = () => setOpen(true);
  const handleCloseSettings = () => setOpen(false);

  return (
    <SettingsViewModelContext.Provider
      value={{
        open,
        setOpen,
        handleOpenSettings,
        handleCloseSettings
      }}
    >
      {children}
    </SettingsViewModelContext.Provider>
  );
};

/**
 * useSettingsViewModelContext
 *
 * @returns {SettingsViewModelType}
 */
export const useSettingsViewModelContext = (): SettingsViewModelType => {
  const context = React.useContext(SettingsViewModelContext);
  if (context === null) {
    throw new Error(
      "useSettingsViewModel must be used within a SettingsViewModelProvider"
    );
  }
  return context;
};
