import ChatPage from "src/pages/Chat/ChatPage";
import { useParams } from "react-router-dom";
import { ChatProvider } from "../pages/Chat/components/ChatContext";

export default function ChatRoute() {
  const { roomId } = useParams();
  return (
    <>
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    </>
  );
}
