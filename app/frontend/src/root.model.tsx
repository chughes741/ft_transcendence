import { useState } from "react";
import { ProfileEntity, UserStatus } from "kingpong-lib";

/**
 * Each page view is a value
 *
 * @enum {string}
 */
export enum PageState {
  Home = "Home",
  Game = "Game",
  Chat = "Chat",
  Profile = "Profile"
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
  sessionToken?: string;
  setSessionToken?: (sessionToken: string) => void;
}

/**
 * Root view model
 *
 * @returns {RootModelType} - Root view model
 */
export const useRootModel = (): RootModelType => {
  /** @todo null until logged in */
  const [self, setSelf] = useState<ProfileEntity>({
    username: "schlurp",
    avatar: "https://i.pravatar.cc/150",
    status: UserStatus.ONLINE,
    createdAt: new Date().toDateString()
  });
  const [pageState, setPageState] = useState<PageState>(PageState.Home);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>();

  return {
    self,
    setSelf,
    pageState,
    setPageState,
    fullscreen,
    setFullscreen,
    sessionToken,
    setSessionToken
  };
};
