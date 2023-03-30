import { useContext, useEffect, useRef } from "react";
import { MessageType } from "./Message";
import Message from "./Message";
import { WebSocketContext } from "../../../contexts/WebSocketContext";

type ChatMessagesContainerProps = {
  messages: Array<MessageType>;
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

const ChatMessagesContainer = ({ messages }: ChatMessagesContainerProps) => {
  const currentUser = useContext(WebSocketContext).id;
  const groupedMessages = groupMessages(messages);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);

  // When a new message is received
  if (lastMessageRef.current) {
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="message-container">
      <div className="messages">
        {groupedMessages.map((message, index) => (
          <Message
            ref={index === groupedMessages.length - 1 ? lastMessageRef : null}
            key={index}
            message={message}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessagesContainer;
