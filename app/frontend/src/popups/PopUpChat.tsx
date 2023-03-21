import "./PopUpChat.tsx.css";
import { useState, useEffect, useContext } from "react";
import { WebSocketContext } from "src/contexts/WebSocketContext";
import { Form } from "react-router-dom";
import { BsChatDots } from "react-icons/bs";
import Icon from "src/components/Icon";

type MessagePayload = {
  room: string;
  message: string;
};

export default function PopUpChat() {
  const [isActive, setIsActive] = useState(false);

  function closePopUp() {
    setIsActive(false);
  }

  function clickPopUp() {
    setIsActive(!isActive);
  }

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.keyCode === 27 || event.key === "Escape") {
        closePopUp();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  });

  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [textValue, setTextValue] = useState("");
  const socket = useContext(WebSocketContext);

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
    socket.emit("sendMessage", { room: socket.id, message: textValue });

    setTextValue("");
  };

  return (
    <>
      <div className="icon">
        <Icon
          color="#000"
          onClick={clickPopUp}
        >
          <BsChatDots />
        </Icon>
      </div>
      <div className={`chat-container ${isActive ? "active" : ""}`}>
        <div className="message-window">
          <div>
            {messages.map((message) => (
              <div>
                {message.room === socket.id ? (
                  <p className="own-message">{message.message}</p>
                ) : (
                  <p>
                    {message.room}: {message.message}
                  </p>
                )}
                <br />
              </div>
            ))}
          </div>
          <div className="input-container">
            <Form onSubmit={sendMessage}>
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
