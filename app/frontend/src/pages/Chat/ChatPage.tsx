/*******************/
/*     System      */
/*******************/
import { useContext } from "react";

/********************/
/*     Contexts     */
/********************/
import { WebsocketContext } from "../../contexts/WebsocketContext";

/***********************/
/*     Components      */
/***********************/
import SideBar from "../../components/SideBar";
import ChatArea from "./components/ChatArea";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";
import ChatContext from "./components/ChatContext";
import RoomList from "./components/RoomList";

export type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

export type RoomType = {
  name: string;
};

export default function ChatPage() {
  /***********************/
  /*   State Variables   */
  /***********************/
  const socket = useContext(WebsocketContext);

  const {
    contextMenuVisible,
    setContextMenuVisible,
    contextMenuPosition,
    handleContextMenu,
    contextMenuData,
    rooms,
    setRooms,
    currentRoomName,
    setCurrentRoomName,
    currentRoomMessages,
    setCurrentRoomMessages,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages
  } = useContext(ChatContext);

  /**************/
  /*   Socket   */
  /**************/
  // useEffect(() => {
  //   socket.on("connect_error", (err) => {
  //     console.log("Error connecting to the server", err);
  //   });
  // }, [socket]);

  //FIXME: refactoring artifact, to remove

  const handleSendMessage = (roomName: string, message: string) => {
    socket.emit("sendMessage", { room: roomName, message });
  };

  /**************************/
  /*   Returned fragment   */
  /*************************/
  return (
    <div className="chat-page">
      <SideBar />
      <RoomList />
      <div className="room-area">
        <ChatArea key={currentRoomName} />
      </div>
    </div>
  );
}
