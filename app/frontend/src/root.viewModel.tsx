import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext, useRootViewModelContext } from "./root.context";
import { useWebSocketContext } from "./contexts/WebSocket.context";
import { useEffect } from "react";
import { createBrowserHistory } from "history";
import { socket } from "./contexts/WebSocket.context";
import { PageState } from "./root.model";

/**
 * Root view model type
 *
 * @interface RootViewModelType
 * @extends {RootModelType}
 */
export interface RootViewModelType extends RootModelType {
  getSessionToken: () => void;
}

/**
 * Root view model provider
 *
 * @param children - Children
 * @returns - Root view model provider
 */
export const RootViewModelProvider = ({ children }) => {
  const rootModel = useRootModel();
  const { sessionToken } = useRootModel();

  /**
   * Redirect to 42Auth
   */
  const getSessionToken = () => {
    console.debug("get session token = ", sessionToken);
  };

  return (
    <RootViewModelContext.Provider
      value={{
        ...rootModel,
        getSessionToken,
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
