import { useState } from "react";
import { ProfileEntity } from "kingpong-lib";

/**
 * Each page view is a value
 * @enum
 */
export enum PageState {
  Home,
  Game,
  Chat,
  Profile,
  FullScreenGame,
  FullScreenChat,
  FullScreenProfile
}

/**
 * Root model type
 *
 * @interface RootModelType
 * @property {ProfileEntity} self - Current user
 * @property {Function} setSelf - Set current user
 */
export interface RootModelType {
  self: ProfileEntity;
  setSelf: (self: ProfileEntity) => void;
}

/**
 * Root view model
 *
 * @returns {RootModelType} - Root view model
 */
export const useRootModel = (): RootModelType => {
  const [self, setSelf] = useState<ProfileEntity>(null);

  return {
    self,
    setSelf
  };
};
