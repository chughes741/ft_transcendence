import { useState } from "react";
import { ProfileEntity } from "kingpong-lib";

/**
 * Each page view is a value
 * 
 * @enum {number}
 */
export enum PageState {
  Home,
  Game,
  Chat,
  Profile
}

/**
 * Root model type
 *
 * @interface RootModelType
 */
export interface RootModelType {
  self: ProfileEntity;
  setSelf: (self: ProfileEntity) => void;
  pageState: PageState;
  setPageState: (pageState: PageState) => void;
}

/**
 * Root view model
 *
 * @returns {RootModelType} - Root view model
 */
export const useRootModel = (): RootModelType => {
  const [self, setSelf] = useState<ProfileEntity>(null);
  const [pageState, setPageState] = useState<PageState>(PageState.Home);

  return {
    self,
    setSelf,
    pageState,
    setPageState
  };
};
