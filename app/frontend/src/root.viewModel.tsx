import ProfileView from "src/profile/profile.view";
import { ChatView } from "src/chat/chat.view";
import GameWindow from "src/game/game.master";
import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext, useRootViewModelContext } from "./root.context";

/**
 * Root view model
 *
 */
export function RootViewModel() {
  const { pageState } = useRootViewModelContext();
  
  switch (pageState) {
    case 0: {
      return <div></div>;
    }
    case 1: {
      return <GameWindow />;
    }
    case 2: {
      return <ChatView />;
    }
    case 3: {
      return <ProfileView />;
    }
    default: {
      return <div></div>;
    }
  }
}

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
  const { self, setSelf, pageState, setPageState } = useRootModel();

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
        doNothing
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
