import { useState, useEffect, useContext } from "react";
import { WebsocketContext } from "src/contexts/WebsocketContext";
import { Form } from "react-router-dom";
import SideBar from "src/components/SideBar";
import Room from "../components/Room";
import { MessageType } from "../components/Message";
import "./ChatPage.tsx.css";
import styled from "styled-components";

const StyledChatPage = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;

  .room-list {
    border-right: 1px solid #ccc;
    padding: 1rem;
    overflow-y: scroll;
    max-width

    .room {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      cursor: pointer;
      border-radius: 5px;
      padding: 0.5rem;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f0f0f0;
      }

      img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 1rem;
      }

      .room-info {
        flex: 1;

        .room-name {
          font-weight: bold;
        }
      }

      .last-message {
        font-size: 0.9rem;
        margin-top: 0.25rem;
        font-weight: bold;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 3em;
        white-space: pre-wrap; // Add this line

        &::before {
          content: "•";
          color: red;
          font-size: 2.5rem;
        }
      }
    }
  }

  .chat-area {
    flex: 1;
  }
`;

type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

// Add this at the top of ChatPage.tsx
type RoomType = {
  id: string;
  imageUrl: string;
  name: string;
  lastMessage: string;
};

export default function ChatPage() {
  const [textValue, setTextValue] = useState("");
  const [roomValue, setRoomValue] = useState("");
  // Change the initial value of rooms to an object
  const [rooms, setRooms] = useState<{ [key: string]: Array<MessageType> }>({});
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [currentRoomMessages, setCurrentRoomMessages] = useState<
    Array<MessageType>
  >([]);

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

  const sendRoomMessage = (roomName: string, message: string) => {
    socket.emit("sendMessage", { room: roomName, message });
  };

  const handleSendMessage = (roomName: string, message: string) => {
    sendRoomMessage(roomName, message);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    console.log("Submitting message:", textValue);
    socket.emit("sendMessage", { room: roomValue, message: textValue });

    setTextValue("");
  };

  const createNewRoom = () => {
    const newRoomId = `Room${Math.floor(Math.random() * 10000)}`;
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      newRooms[newRoomId] = [];
      return newRooms;
    });
    setCurrentRoomName(newRoomId);
    setCurrentRoomMessages([]);
  };

  return (
    <>
      <SideBar />
      <StyledChatPage>
        <div className="room-list">
          {/* Update how rooms are rendered */}
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
          <button onClick={createNewRoom}>Create New Room</button>
        </div>
        <div className="chat-area">
          <Room
            roomName={currentRoomName}
            messages={currentRoomMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </StyledChatPage>
    </>
  );
}
