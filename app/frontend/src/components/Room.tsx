import React, { useContext, useEffect, useRef } from "react";
import Message, { MessageType } from "./Message";
import styled from "styled-components";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { Form } from "react-router-dom";
import Input from "../components/Input";
import ResizableTextArea from "./ResizableTextArea";

const StyledRoom = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;

    .title {
      h3 {
        background-color: #0077b6;
        border-radius: 5px 5px 0px 0px;
        text-align: center;
        margin: 0;
        padding: 0;
        width: 100%;
      }
    }

    .message-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #ccc;
      border-radius: 0px 0px 5px 5px;
      margin-bottom: 1rem;
      background-color: white;
      height: 80vh;
      max-width: 100%;

      .messages {
        flex: 1;
        overflow-y: scroll;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #ccc;
        display: flex;
        flex-direction: column;
      }

      Form {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      form {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      input {
        flex: 1;
        margin-right: 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 5px; // Add a border radius to make the input look like the textbox in the prompt
        min-height: 10vh;
        max-height: 40vh;
        max-width: 100%;
      }
    }
  }
`;

type RoomProps = {
  roomName: string;
  messages: Array<MessageType>;
  onSendMessage: (roomName: string, message: string) => void;
};

const groupMessages = (messages: Array<MessageType>): Array<MessageType> => {
  const groupedMessages: Array<MessageType> = [];

  messages.forEach((msg, index) => {
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const displayTimestamp =
      !nextMessage || nextMessage.timestamp !== msg.timestamp;
    const displayUser = !prevMessage || prevMessage.user !== msg.user;

    groupedMessages.push({
      ...msg,
      displayUser,
      displayTimestamp
    });
  });

  return groupedMessages;
};

const Room = (room: RoomProps) => {
  const [textValue, setTextValue] = React.useState("");
  const socket = useContext(WebsocketContext);

  const sendMessage = (event) => {
    event.preventDefault();
    room.onSendMessage(room.roomName, textValue);
    setTextValue("");
  };
  const currentUser = socket.id;
  const groupedMessages = groupMessages(room.messages);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  // When new messages are received, scroll to it
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);

  return (
    <StyledRoom>
      <div className="chat-area">
        <div className="title">
          <h3>{room.roomName}</h3>
        </div>
        <div className="message-container">
          <div className="messages">
            {groupedMessages.map((message, index) => (
              <Message
                ref={
                  index === groupedMessages.length - 1 ? lastMessageRef : null
                }
                key={index}
                message={message}
                currentUser={currentUser}
              />
            ))}
          </div>
          <div className="input-container">
            <form onSubmit={sendMessage}>
              <ResizableTextArea
                value={textValue}
                placeholder="You take the text, and you put it in the box."
                onChange={(event) => setTextValue(event.target.value)}
                onEnterPress={sendMessage}
              />
            </form>
          </div>
        </div>
      </div>
    </StyledRoom>
  );
};

export default Room;
