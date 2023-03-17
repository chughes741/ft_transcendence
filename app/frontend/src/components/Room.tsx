import React, { useContext } from "react";
import Message, { MessageType } from "./Message";
import styled from "styled-components";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { Form } from "react-router-dom";

const StyledRoom = styled.div`
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
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 0px 0px 5px 5px;
    margin-bottom: 1rem;
    background-color: white;
    .messages {
      flex: 1;
      overflow-y: visible;
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

    input {
      flex: 1;
      margin-right: 1rem;
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
  const currentUser = socket.id; // Add this line
  const groupedMessages = groupMessages(room.messages);

  return (
    <StyledRoom>
      <div className="title">
        <h3>{room.roomName}</h3>
      </div>
      <div className="message-container">
        <div className="messages">
          {groupedMessages.map((message, index) => (
            <Message
              key={index}
              message={message}
              currentUser={currentUser} // Add this line
            />
          ))}
        </div>
        <Form onSubmit={sendMessage}>
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
    </StyledRoom>
  );
};

export default Room;
