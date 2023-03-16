import { useState, useEffect, useContext } from "react";
import { WebsocketContext } from "src/contexts/WebsocketContext";
import { Form } from "react-router-dom";
import SideBar from "src/components/SideBar";
import Room from "../components/Room";
import { MessageType } from "../components/Message";
import "./ChatPage.tsx.css";

type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

export default function ChatPage() {
  const [textValue, setTextValue] = useState("");
  const [roomValue, setRoomValue] = useState("");
  const [rooms, setRooms] = useState<Record<string, MessageType[]>>({});
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
        isOwn: newMessage.room === socket.id
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

  const sendMessage = (event) => {
    event.preventDefault();
    console.log("Submitting message:", textValue);
    socket.emit("sendMessage", { room: roomValue, message: textValue });

    setTextValue("");
  };

  return (
    <>
      <SideBar />
      <div className="chat-page">
        <div className="message-window">
          <div className="input-container">
            {Object.keys(rooms).map((roomName) => (
              <Room
                key={roomName}
                roomName={roomName}
                messages={rooms[roomName]}
                onSendMessage={sendRoomMessage}
              />
            ))}
            <Form onSubmit={sendMessage}>
              <input
                value={roomValue}
                type="text"
                required
                placeholder="room to send message to"
                onChange={(event) => setRoomValue(event.target.value)}
              />
              <input
                value={textValue}
                type="text"
                required
                placeholder="Write right here"
                onChange={(event) => setTextValue(event.target.value)}
              />
              <button type="submit">Send</button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
