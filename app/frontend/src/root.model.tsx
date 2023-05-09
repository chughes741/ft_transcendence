import { useState } from "react";
import { ProfileEntity } from "kingpong-lib";

/**
 * Each page view is a value
 *
 * @enum {string}
 */
export enum PageState {
  Auth = "Auth",
  Home = "Home",
  Game = "Game",
  Chat = "Chat",
  Profile = "Profile",
  Verify2FA = "Verify2FA",
  Enable2FA = "Enable2FA"
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

  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;

  showChooseUsernameModal: boolean;
  setShowChooseUsernameModal: (fullscreen: boolean) => void;

  sessionToken?: string;
  setSessionToken?: (sessionToken: string) => void;

  displayGameInvite: boolean;
  setDisplayGameInvite: (displayGameInvite: boolean) => void;
}

/**
 * Root view model
 *
 * @returns {RootModelType} - Root view model
 */
export const useRootModel = (): RootModelType => {
  /** @todo null until logged in */
  const [self, setSelf] = useState<ProfileEntity>(new ProfileEntity());
  const [pageState, setPageState] = useState<PageState>(PageState.Auth);
  const [fullscreen, setFullscreen] = useState<boolean>(true);
  const [showChooseUsernameModal, setShowChooseUsernameModal] =
    useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [displayGameInvite, setDisplayGameInvite] = useState<boolean>(false);
  return {
    self,
    setSelf,
    pageState,
    setPageState,
    fullscreen,
    setFullscreen,
    showChooseUsernameModal,
    setShowChooseUsernameModal,
    sessionToken,
    setSessionToken,
    displayGameInvite,
    setDisplayGameInvite
  };
};
