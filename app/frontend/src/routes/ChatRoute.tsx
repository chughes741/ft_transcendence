import ChatPage from "src/pages/ChatPage";
import { useParams } from "react-router-dom";

export default function ChatRoute() {
  const { roomId } = useParams();
  return (
    <>
      <ChatPage />
    </>
  );
}
