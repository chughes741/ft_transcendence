import PopUp from "../popups/PopUpMenu";
import { useContext, useState, useEffect } from "react";
import {
  WebsocketContext,
  WebsocketProvider
} from "../contexts/WebsocketContext";
import { Form } from "react-router-dom";

type MessagePayload = {
  clientId: string;
  body: string;
};

export default function ChatTest() {
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [textValue, setTextValue] = useState("");
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
    socket.emit("newMessage", textValue);

    setTextValue("");
  };

  return (
    <>
      <PopUp />
      <div className="chat-container">
        <div className="message-window">
          <div>
            {messages.map((message) => (
              <div>
                {message.clientId === socket.id ? (
                  <p className="own-message">{message.body}</p>
                ) : (
                  <p>
                    {message.clientId}: {message.body}
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
                Submit
              </button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
