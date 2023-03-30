/*******************/
/*     System      */
/*******************/
import { Tooltip } from "@mui/material";
import { forwardRef } from "react";
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

type MessageProps = {
  message: MessageType;
};

const Message = forwardRef<HTMLDivElement, MessageProps>(({ message }, ref) => {
  return (
    <StyledMessage
      isCurrentUser={message.isOwn}
      ref={ref}
    >
      {message.displayUser && (
        <span className="sender">{message.isOwn ? "Me" : message.user}</span>
      )}
      <Tooltip
        title={message.timestamp}
        placement={message.isOwn ? "left-end" : "right-end"}
        enterDelay={800}
      >
        <div
          className={`message-content ${message.isOwn ? "own-message" : ""}`}
        >
          {message.message}
        </div>
      </Tooltip>
      {message.displayTimestamp && (
        <span className="timestamp">{message.timestamp}</span>
      )}
    </StyledMessage>
  );
});

export default Message;
