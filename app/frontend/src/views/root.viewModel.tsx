import GamePage from "../pages/GamePage";
import ProfilePage from "src/pages/profile/ProfilePage";
import { ChatViewModelProvider } from "../pages/Chat/ChatViewModel";
import { ChatView } from "../pages/Chat/ChatView";

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
      return (
        <ChatViewModelProvider>
          <ChatView />;
        </ChatViewModelProvider>
      );
    }
    case 3: {
      return <ProfilePage />;
    }
    default: {
      return <div></div>;
    }
  }
}
