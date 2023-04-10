import { useEffect, useRef } from "react";
import { MessageType } from "./Message";
import Message from "./Message";
import { Box } from "@mui/material";
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";

const isSameDate = (date1: Date, date2: Date): boolean => {
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    console.error(
      "One or both of the inputs are not Date objects:",
      date1,
      date2
    );
    return false;
  }
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const groupMessages = (
  messages: Array<MessageType>
): Array<MessageType> | null => {
  const groupedMessages: Array<MessageType> = [];
  if (!messages) {
    console.log("No messages to display");
    return null;
  }

  messages.forEach((msg, index) => {
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const displayTimestamp =
      !nextMessage || nextMessage.timestamp_readable !== msg.timestamp_readable;
    const displayUser = !prevMessage || prevMessage.user !== msg.user;
    const displayDate =
      !prevMessage || !isSameDate(prevMessage.timestamp, msg.timestamp);

    groupedMessages.push({
      ...msg,
      displayUser,
      displayTimestamp,
      displayDate
    });
  });

  return groupedMessages;
};

const ChatMessagesContainerView = () => {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const {
    currentRoomMessages,
    currentRoomName,
    rooms,
    setCurrentRoomMessages
  } = useChatViewModelContext();
  useEffect(() => {
    if (rooms[currentRoomName]) {
      setCurrentRoomMessages(rooms[currentRoomName].messages);
    }
  }, [currentRoomName]);
  const groupedMessages = groupMessages(currentRoomMessages);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);
  if (lastMessageRef.current) {
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const BoxStyle = {
    display: "flex",
    flex: "1",
    "flex-direction": "column",
    padding: "16px",
    width: "100%",
    "overflow-y": "auto",
    "overflow-x": "hidden"
  };
  return (
    <Box style={BoxStyle}>
      {groupedMessages &&
        groupedMessages.map((message, index) => (
          <Message
            ref={index === groupedMessages.length - 1 ? lastMessageRef : null}
            key={index}
            message={message}
          />
        ))}
    </Box>
  );
};

export default ChatMessagesContainerView;
