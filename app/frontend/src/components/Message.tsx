import React from "react";
import styled from "styled-components";

interface StyledMessageProps {
  isCurrentUser: boolean;
}

const StyledMessage = styled.div<StyledMessageProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  align-items: ${({ isCurrentUser }) =>
    isCurrentUser ? "flex-end" : "flex-start"};

  .sender {
    font-weight: bold;
    color: #999;
  }

  .timestamp {
    font-size: 12px;
    color: #999;
  }
`;

const MessageContent = styled.div`
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #ccc;

  &.own-message {
    background-color: #00b4d8;
    align-self: flex-end;
  }
`;

export type MessageType = {
  user: string;
  roomId: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  displayUser: boolean;
  displayTimestamp: boolean;
};

type Props = {
  message: MessageType;
  currentUser: string;
  ref: React.RefObject<HTMLDivElement> | null;
};

const Message: React.FC<Props> = ({ message, currentUser }) => {
  const isCurrentUser = message.user === currentUser;
  return (
    <StyledMessage isCurrentUser={isCurrentUser}>
      {message.displayUser && (
        <span className="sender">{isCurrentUser ? "Me" : message.user}</span>
      )}
      <MessageContent
        className={`message-content ${isCurrentUser ? "own-message" : ""}`}
      >
        {message.message}
      </MessageContent>
      {message.displayTimestamp && (
        <span className="timestamp">{message.timestamp}</span>
      )}
    </StyledMessage>
  );
};

export default Message;
