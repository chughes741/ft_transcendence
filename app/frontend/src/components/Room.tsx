import React from "react";
import Message, { MessageType } from "./Message";
import styled from "styled-components";

const StyledRoom = styled.div`
   {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 1rem;

    h3 {
      margin-bottom: 1rem;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #ccc;
      display: flex;
      flex-direction: column;
    }

    form {
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

const Room = (room: RoomProps) => {
  const [textValue, setTextValue] = React.useState("");

  const sendMessage = (event) => {
    event.preventDefault();
    room.onSendMessage(room.roomName, textValue);
    setTextValue("");
  };

  return (
    <StyledRoom>
      <h3>{room.roomName}</h3>
      <div className="messages">
        {room.messages.map((message, index) => (
          <Message
            key={index}
            message={message.message}
            timestamp={message.timestamp}
            user={message.user}
            roomId={message.roomId}
            isOwn={message.isOwn}
          />
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={textValue}
          type="text"
          required
          placeholder="Write right here"
          onChange={(event) => setTextValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </StyledRoom>
  );
};

export default Room;
