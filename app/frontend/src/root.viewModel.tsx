import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext } from "./root.context";

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
  const {
    self,
    setSelf,
    pageState,
    setPageState,
    fullscreen,
    setFullscreen,
    sessionToken,
    setSessionToken
  } = useRootModel();

  /**
   * Redirect to 42Auth
   */
  const getSessionToken = () => {
    console.log("get session token");
  };

  return (
    <RootViewModelContext.Provider
      value={{
        self,
        setSelf,
        pageState,
        setPageState,
        fullscreen,
        setFullscreen,
        sessionToken,
        setSessionToken,
        getSessionToken
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
