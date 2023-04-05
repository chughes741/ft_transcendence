
import ProfilePage from "src/pages/profile/ProfilePage";
import { ChatView } from "../pages/chat/ChatView";
import GameWindow from "src/game/game.master";

/**
 * Root view model
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
      return <ProfilePage />;
    }
    default: {
      return <div></div>;
    }
  }
}
