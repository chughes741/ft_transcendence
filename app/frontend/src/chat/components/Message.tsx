import { forwardRef } from "react";
import { Tooltip, Typography, Divider, Avatar, Fade } from "@mui/material";
import "src/styles/chat/Message.css";
import { MessageType } from "../chat.types";

/* Support for code blocks */
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrowNight } from "react-syntax-highlighter/dist/esm/styles/hljs";

type MessageProps = {
  message: MessageType;
};

const renderMessageContent = (content: string) => {
  const codeBlockPattern = /```(\w+)?\s*([\s\S]+?)\s*```/g;
  let lastIndex = 0;
  const contentElements: React.ReactNode[] = [];

  let match;
  while ((match = codeBlockPattern.exec(content))) {
    if (lastIndex < match.index) {
      contentElements.push(content.slice(lastIndex, match.index));
    }

    const language = match[1] || "javascript";
    console.log(`language: ${language}`);
    const code = match[2].trim();
    contentElements.push(
      <SyntaxHighlighter
        language={language}
        style={tomorrowNight}
        customStyle={{ textAlign: "left" }}
      >
        {code}
      </SyntaxHighlighter>
    );

    lastIndex = codeBlockPattern.lastIndex;
  }

  if (lastIndex < content.length) {
    contentElements.push(content.slice(lastIndex));
  }

  return contentElements;
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
        <>
          {!message.isOwn && (
            <Tooltip
              title={message.username}
              TransitionComponent={Fade}
              placement={message.isOwn ? "left-end" : "right-end"}
              enterDelay={100}
            >
              <Avatar
                alt={message.username}
                src={`https://i.pravatar.cc/150?u=${message.username}`}
              />
            </Tooltip>
          )}
          <Typography className={`sender`}>
            {message.isOwn ? "Me" : message.username}
          </Typography>
        </>
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
          {renderMessageContent(message.content)}
        </div>
      </Tooltip>
      {message.displayTimestamp && (
        <span className="timestamp">{message.timestamp_readable}</span>
      )}
    </div>
  );
});

export default Message;
