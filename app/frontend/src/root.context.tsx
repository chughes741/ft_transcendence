import { createContext, useContext } from "react";
import { RootViewModelType } from "./root.viewModel";

/**
 * Root view model context
 *
 * @type {React.Context<RootViewModelType | null>}
 */
export const RootViewModelContext: React.Context<RootViewModelType | null> =
  createContext<RootViewModelType | null>(null);

/**
 * Use root view model context
 *
 * @returns {RootViewModelType} - Root view model context
 */
export const useRootViewModelContext = (): RootViewModelType => {
  const context = useContext(RootViewModelContext);
  if (context === null) {
    throw new Error(
      "useRootViewModelContext must be used within a RootViewModelProvider"
    );
  }
  return context;
};
