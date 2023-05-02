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
        getSessionToken
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
