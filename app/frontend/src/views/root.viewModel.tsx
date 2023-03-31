import GamePage from "../pages/GamePage";
import ChatPage from "../pages/Chat/ChatPage";
import ProfilePage from "src/pages/profile/ProfilePage";

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
      return <ChatPage />;
    }
    case 3: {
      return <ProfilePage />;
    }
    default: {
      return <div></div>;
    }
  }
}
