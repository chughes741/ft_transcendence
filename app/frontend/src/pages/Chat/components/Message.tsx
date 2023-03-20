/*******************/
/*     System      */
/*******************/
import React, { forwardRef } from "react";
import styled from "styled-components";

/***************/
/*     CSS     */
/***************/
import "../styles/Message.css";

interface StyledMessageProps {
  isCurrentUser: boolean;
}

const StyledMessage = styled.div<StyledMessageProps>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isCurrentUser }) =>
    isCurrentUser ? "flex-end" : "flex-start"};
  width: 94%;
  margin: 5px 3%;

  .sender {
    font-weight: 700;
    color: #999;
  }

  .timestamp {
    font-size: 12px;
    color: #999;
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
};

const Message = forwardRef<HTMLDivElement, Props>(
  ({ message, currentUser }, ref) => {
    const isCurrentUser = message.user === currentUser;
    return (
      <StyledMessage isCurrentUser={isCurrentUser}>
        {message.displayUser && (
          <span className="sender">{isCurrentUser ? "Me" : message.user}</span>
        )}
        <div
          className={`message-content ${isCurrentUser ? "own-message" : ""}`}
        >
          {message.message}
        </div>
        {message.displayTimestamp && (
          <span className="timestamp">{message.timestamp}</span>
        )}
      </StyledMessage>
    );
  }
);

export default Message;
