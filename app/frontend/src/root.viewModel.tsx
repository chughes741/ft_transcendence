import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext } from "./root.context";

/**
 * Root view model type
 *
 * @interface RootViewModelType
 * @extends {RootModelType}
 */
export interface RootViewModelType extends RootModelType {
  doNothing: () => void;
}

/**
 * Root view model provider
 *
 * @param children - Children
 * @returns - Root view model provider
 */
export const RootViewModelProvider = ({ children }) => {
  const { self, setSelf, pageState, setPageState, fullscreen, setFullscreen } =
    useRootModel();

  /** @todo remove once other methods are created */
  const doNothing = () => {
    console.log("do nothing");
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
        doNothing
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
