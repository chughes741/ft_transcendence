import React from "react";

/**
 * Settings model
 *
 * @interface SettingsModelType
 */
export interface SettingsModelType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * useSettingsModel
 *
 * @returns {SettingsModelType}
 */
export const useSettingsModel = (): SettingsModelType => {
  const [open, setOpen] = React.useState<boolean>(false);

  return {
    open,
    setOpen
  };
};
