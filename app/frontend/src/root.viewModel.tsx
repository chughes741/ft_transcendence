import ProfileView from "src/profile/profile.view";
import { ChatView } from "src/chat/chat.view";
import GameWindow from "src/game/game.master";
import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext } from "./root.context";

/**
 * Root view model
 *
 * @param props - Page state
 * @returns - Main view component
 */
export function RootViewModel(props) {
  switch (props.state) {
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
export interface RootViewModelType extends RootModelType {}

export const RootViewModelProvider = ({ children }) => {
  const { self, setSelf } = useRootModel();

  return (
    <RootViewModelContext.Provider
      value={{
        self,
        setSelf
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
