import React from "react";
import styled from "styled-components";

const StyledMessage = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: #f1f1f1;
  max-width: 80%;

  &.own-message {
    background-color: #89cff0;
    align-self: flex-end;
  }

  .sender {
    font-size: 0.8rem;
    color: #777;
  }

  .timestamp {
    font-size: 0.7rem;
    color: gray;
  }
`;

export type MessageType = {
  user: string;
  roomId: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
};

const Message = (message: MessageType) => {
  return (
    <StyledMessage className={`message ${message.isOwn ? "own-message" : ""}`}>
      <span className="sender">{message.user}</span>
      <span className="timestamp">{message.timestamp}</span>
      <div className="message-content">{message.message}</div>
    </StyledMessage>
  );
};

export default Message;
