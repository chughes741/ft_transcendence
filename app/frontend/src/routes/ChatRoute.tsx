import ChatPage from "src/pages/Chat/ChatPage";
import { useParams } from "react-router-dom";

export default function ChatRoute() {
  const { roomId } = useParams();
  return (
    <>
      <ChatPage />
    </>
  );
}
