/*******************/
/*     System      */
/*******************/
import { useState, useEffect, useContext, useRef } from "react";

/********************/
/*     Contexts     */
/********************/
import { WebsocketContext } from "../../contexts/WebsocketContext";

/***********************/
/*     Components      */
/***********************/
import SideBar from "../../components/SideBar";
import Room from "./components/Room";
import { MessageType } from "./components/Message";
import { CreateRoomModal } from "./components/CreateRoomModal";
import Button from "../../components/Button";

/***************/
/*     CSS     */
/***************/
import "./styles/ChatPage.css";
import { JoinRoomModal } from "./components/JoinRoomModal";
import ContextMenu from "./components/ContextMenu";
import ButtonFunky from "../../components/ButtonFunky";

type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

type RoomType = {
  id?: string;
  imageUrl?: string;
  name: string;
  lastMessage?: string;
};

export default function ChatPage() {
  /***********************/
  /*   State Variables   */
  /***********************/

  // Change the initial value of rooms to an object
  const [rooms, setRooms] = useState<{ [key: string]: Array<MessageType> }>({});
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [currentRoomMessages, setCurrentRoomMessages] = useState<
    Array<MessageType>
  >([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});

  const socket = useContext(WebsocketContext);

  /********************/
  /*   Context Menu   */
  /********************/
  const contextMenuRef = useRef(null);
  const [contextMenuData, setContextMenuData] = useState<RoomType | null>(null);
  const handleContextMenu = (e: React.MouseEvent, roomData: RoomType) => {
    e.preventDefault();

    contextMenuRef.current.style.display = "block";
    contextMenuRef.current.style.top = `${e.clientY}px`;
    contextMenuRef.current.style.left = `${e.clientX}px`;

    setContextMenuData(roomData);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        contextMenuRef.current.style.display = "none";
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  /**********************/
  /*   Room Functions   */
  /**********************/
  const sendRoomMessage = (roomName: string, message: string) => {
    socket.emit("sendMessage", { room: roomName, message });
  };

  const handleSendMessage = (roomName: string, message: string) => {
    sendRoomMessage(roomName, message);
  };

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

  const createNewRoom = (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD",
    password: string
  ) => {
    console.log("ChatPage: Creating new room", roomName, roomStatus, password);
    socket.emit("createRoom", { roomName, roomStatus, password });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      newRooms[roomName] = [];
      return newRooms;
    });
    setCurrentRoomName(roomName);
  };

  const joinRoom = (roomName: string, password: string) => {
    console.log("ChatPage: Creating new room", roomName, password);
    socket.emit("joinRoom", { roomName, password });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      newRooms[roomName] = [];
      return newRooms;
    });
    setCurrentRoomName(roomName);
  };

  const leaveRoom = (roomName: string) => {
    socket.emit("leaveRoom", { roomName });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      delete newRooms[roomName];
      return newRooms;
    });
  };

  /**************/
  /*   Socket   */
  /**************/
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Successfully connected to the server");

      // FIXME: For testing purposes only
      // Join three separate rooms on connection
      joinRoom("PublicRoom", ""); // Public room
      joinRoom("PrivateRoom", ""); // Private room
      joinRoom("PasswordProtectedRoom", "placeholder"); // Password protected room with a placeholder password
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

  // Textbar Focus
  useEffect(() => {
    if (rooms[currentRoomName]) {
      setCurrentRoomMessages(rooms[currentRoomName]);
    } else {
      setCurrentRoomMessages([]);
    }
  }, [rooms, currentRoomName]);

  /********************/
  /*   Returned div   */
  /********************/
  return (
    <div className="chat-page">
      <SideBar />
      <div className="room-list">
        <ButtonFunky
          content="Create New Room"
          onClick={() => setShowCreateRoomModal(true)}
          width="100%"
        />
        <div> </div>
        <Button
          content="Join Room"
          onClick={() => setShowJoinRoomModal(true)}
          width="100%"
        />
        <div> </div>
        {Object.entries(rooms).map(([roomId, messages]) => (
          <div
            key={roomId}
            className="room-item"
            onClick={() => {
              setCurrentRoomName(roomId);
              setCurrentRoomMessages(messages);
            }}
            onContextMenu={(e) => handleContextMenu(e, { name: roomId })}
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
          showModal={showCreateRoomModal}
          closeModal={() => setShowCreateRoomModal(false)}
          onCreateRoom={createNewRoom}
        />
        <JoinRoomModal
          showModal={showJoinRoomModal}
          closeModal={() => setShowJoinRoomModal(false)}
          onCreateRoom={joinRoom}
        />
        <Room
          key={currentRoomName}
          roomName={currentRoomName}
          messages={currentRoomMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
      <ContextMenu
        ref={contextMenuRef}
        options={[
          {
            label: "Leave Room",
            onClick: () => {
              if (contextMenuData) {
                leaveRoom(contextMenuData.name);
                contextMenuRef.current.style.display = "none";
              }
            }
          }
        ]}
      />
    </div>
  );
}
