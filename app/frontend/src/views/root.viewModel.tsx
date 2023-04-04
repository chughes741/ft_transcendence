import GamePage from "../pages/GamePage";
import ProfileView from "src/views/profile/profile.view";
import { ChatView } from "../pages/chat/ChatView";

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
      return <GamePage />;
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
