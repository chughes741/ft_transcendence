import React from "react";

export interface SettingsModelType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSettingsModel = (): SettingsModelType => {
  const [open, setOpen] = React.useState<boolean>(false);

  return {
    open,
    setOpen
  };
};
