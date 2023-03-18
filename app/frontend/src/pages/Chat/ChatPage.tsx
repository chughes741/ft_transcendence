/*******************/
/*     System      */
/*******************/
import { useState, useEffect, useContext } from "react";

/********************/
/*     Contexts     */
/********************/
import { WebsocketContext } from "../../contexts/WebsocketContext";

/***********************/
/*     Components      */
/***********************/
import SideBar from "../../components/SideBar";
import Room from "./Room";
import { MessageType } from "./Message";
import { CreateRoomModal } from "./CreateRoomModal";
import Button from "../../components/Button";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";

type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

type RoomType = {
  id: string;
  imageUrl: string;
  name: string;
  lastMessage: string;
};

export default function ChatPage() {
  const [textValue, setTextValue] = useState<string>("");
  const [roomValue, setRoomValue] = useState<string>("");
  // Change the initial value of rooms to an object
  const [rooms, setRooms] = useState<{ [key: string]: Array<MessageType> }>({});
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [currentRoomMessages, setCurrentRoomMessages] = useState<
    Array<MessageType>
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});

  const socket = useContext(WebsocketContext);

  const addMessageToRoom = (roomName: string, message: MessageType) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        newRooms[roomName] = [];
      }
      newRooms[roomName].push(message);
      return newRooms;
    });
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("connect_error", (err) => {
      console.log("Error connecting to the server", err);
    });

    socket.on("disconnect", () => {
      console.log("Successfully disconnected from the server");
    });

    socket.on("onMessage", (newMessage: MessagePayload) => {
      console.log("Ding ding, you've got mail:", newMessage);

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

      const messageData: MessageType = {
        user: newMessage.user,
        roomId: newMessage.room,
        message: newMessage.message,
        timestamp,
        isOwn: newMessage.user === socket.id,
        displayUser: true,
        displayTimestamp: true
      };

      addMessageToRoom(newMessage.room, messageData);
    });

    return () => {
      socket.off("onMessage");
    };
  }, [socket]);

  useEffect(() => {
    if (rooms[currentRoomName]) {
      setCurrentRoomMessages(rooms[currentRoomName]);
    } else {
      setCurrentRoomMessages([]);
    }
  }, [rooms, currentRoomName]);

  const sendRoomMessage = (roomName: string, message: string) => {
    socket.emit("sendMessage", { room: roomName, message });
  };

  const handleSendMessage = (roomName: string, message: string) => {
    sendRoomMessage(roomName, message);
  };

  const createNewRoom = (
    roomName: string,
    roomStatus: "public" | "private",
    password: string
  ) => {
    console.log("ChatPage: Creating new room", roomName, roomStatus, password);
    socket.emit("joinRoom", { roomName, roomStatus, password });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      newRooms[roomName] = [];
      return newRooms;
    });
    setCurrentRoomName(roomName);
  };

  return (
    <div className="chat-page">
      <SideBar />
      <div className="room-list">
        <Button
          content="Create New Room"
          onClick={() => setShowModal(true)}
          width="100%"
        />
        {Object.entries(rooms).map(([roomId, messages]) => (
          <div
            key={roomId}
            className="room"
            onClick={() => {
              setCurrentRoomName(roomId);
              setCurrentRoomMessages(messages);
            }}
          >
            <img
              src={`https://i.pravatar.cc/150?u=${roomId}`} // Use a random profile picture for each room
              alt="Profile"
            />
            <div className="room-info">
              <div className="room-name">{roomId}</div>
              <div className="last-message">
                {messages.length > 0
                  ? messages[messages.length - 1].message
                  : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="room-area">
        <CreateRoomModal
          showModal={showModal}
          closeModal={() => setShowModal(false)}
          onCreateRoom={createNewRoom}
        />
        <Room
          key={currentRoomName}
          roomName={currentRoomName}
          messages={currentRoomMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
