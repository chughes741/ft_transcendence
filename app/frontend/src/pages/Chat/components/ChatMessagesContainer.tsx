import { useEffect, useRef } from "react";
import { MessageType } from "./Message";
import Message from "./Message";
import { Box } from "@mui/material";

type ChatMessagesContainerProps = {
  messages: Array<MessageType>;
};

const groupMessages = (messages: Array<MessageType>): Array<MessageType> => {
  const groupedMessages: Array<MessageType> = [];

  messages.forEach((msg, index) => {
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const displayTimestamp =
      !nextMessage || nextMessage.timestamp_readable !== msg.timestamp_readable;
    const displayUser = !prevMessage || prevMessage.user !== msg.user;

    groupedMessages.push({
      ...msg,
      displayUser,
      displayTimestamp
    });
  });

  return groupedMessages;
};

const ChatMessagesContainer = ({ messages }: ChatMessagesContainerProps) => {
  const groupedMessages = groupMessages(messages);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      overflow-y="auto"
      style={{
        padding: "16px",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden"
      }}
    >
      {groupedMessages.map((message, index) => (
        <Message
          ref={index === groupedMessages.length - 1 ? lastMessageRef : null}
          key={index}
          message={message}
        />
      ))}
    </Box>
  );
};

export default ChatMessagesContainer;
