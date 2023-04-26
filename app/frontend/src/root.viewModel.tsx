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

  const { addSocketListener, removeSocketListener } = useWebSocketContext();
  const history = createBrowserHistory();

  const handleUnauthorized = () => {
    const { setSessionToken, setPageState, setFullscreen, setSelf } = useRootViewModelContext();
    console.log("Unauthorized Token declared")
    fetch(`/auth/deleteToken?socketId=${socket.id}`, {
      method: 'POST',
    });
    setSessionToken("");
    setPageState(PageState.Auth);
    history.push("/auth");
    setFullscreen(true);
    setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
    console.log("Unauthorized Token declared")
  }

  addSocketListener("unauthorized", handleUnauthorized);

  useEffect(() => {

    return () => {
      removeSocketListener("unauthorized")
    }
  })

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
        getSessionToken
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
