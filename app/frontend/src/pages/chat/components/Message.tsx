import { forwardRef } from "react";
import { Tooltip, Typography, Divider, Avatar, Fade } from "@mui/material";
import "../styles/Message.css";
import { Box } from "@mui/system";

export type MessageType = {
  user: string;
  roomId: string;
  message: string;
  timestamp_readable: string;
  timestamp: Date;
  isOwn: boolean;
  displayUser: boolean;
  displayTimestamp: boolean;
  displayDate: boolean;
};

type MessageProps = {
  message: MessageType;
};

const Message = forwardRef<HTMLDivElement, MessageProps>(({ message }, ref) => {
  const tooltip_timestamp = new Date(message.timestamp).toLocaleTimeString(
    "en-US",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    }
  );

  return (
    <div
      className={`message-wrapper ${message.isOwn ? "own-message" : ""}`}
      ref={ref}
    >
      {message.displayDate && (
        <>
          <li style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <Divider style={{ flex: 1 }} />
            <Typography
              sx={{ mx: 1, mt: 0.5 }}
              color="text.secondary"
              display="block"
              variant="caption"
              component="span"
            >
              {message.timestamp.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </Typography>
            <Divider style={{ flex: 1 }} />
          </li>
        </>
      )}
      {message.displayUser && (
        <Box
          display="flex"
          flexDirection="row"
        >
          <Avatar
            alt={message.user}
            src={`https://i.pravatar.cc/150?u=${message.user}`}
          />
          <span className="sender">{message.isOwn ? "Me" : message.user}</span>
        </Box>
      )}
      <Tooltip
        title={tooltip_timestamp}
        TransitionComponent={Fade}
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
        <span className="timestamp">{message.timestamp_readable}</span>
      )}
    </div>
  );
});

export default Message;
