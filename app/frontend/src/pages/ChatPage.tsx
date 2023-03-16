import "./ChatPage.tsx.css";
import { useState, useEffect, useContext } from "react";
import { WebsocketContext } from "src/contexts/WebsocketContext";
import { Form } from "react-router-dom";
import SideBar from "src/components/SideBar";

type MessagePayload = {
  user: string;
  room: string;
  message: string;
};

export default function PopUpChat() {
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [textValue, setTextValue] = useState("");
  const [roomValue, setRoomValue] = useState("");
  const socket = useContext(WebsocketContext);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("connect_error", (err) => {
      console.log("Error connecting to the server", err);
    });

    socket.on("onMessage", (newMessage: MessagePayload) => {
      console.log("Ding ding, you've got mail:", newMessage);

      console.log(newMessage.room, socket.id);
      console.log(newMessage.message);
      setMessages((messages) => [...messages, newMessage]);
    });

    socket.on("disconnect", () => {
      console.log("Successfully disconnected from the server");
    });

    return () => {
      console.log("Unregistering events...");
      socket.off("connect");
      socket.off("onMessage");
    };
  }, [socket]);

  const sendMessage = (event) => {
    event.preventDefault();
    console.log("Submitting message:", textValue);
    socket.emit("newMessage", { room: roomValue, message: textValue });

    setTextValue("");
  };

  return (
    <>
      <div className="chat-page">
        <div className="message-window">
          <SideBar />
          <div>
            {messages.map((message) => (
              <div>
                {message.room === socket.id ? (
                  <p className="own-message">
                    {message.room}: {message.message}
                  </p>
                ) : (
                  <p>
                    {message.room}/{message.user}: {message.message}
                  </p>
                )}
                <br />
              </div>
            ))}
          </div>
          <div className="input-container">
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
              <button
                type="submit"
                // onClick={sendMessage}
              >
                Send
              </button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
