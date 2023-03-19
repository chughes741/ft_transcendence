/*******************/
/*     System      */
/*******************/
import React, { useContext, useEffect, useRef } from "react";

/********************/
/*     Contexts     */
/********************/
import { WebsocketContext } from "../../../contexts/WebsocketContext";

/***********************/
/*     Components      */
/***********************/
import Input from "../../../components/Input";
import ResizableTextArea from "../../../components/ResizableTextArea";
import Message, { MessageType } from "./Message";

/***************/
/*     CSS     */
/***************/
import "../styles/Room.css";

type RoomProps = {
  roomName: string;
  messages: Array<MessageType>;
  onSendMessage: (roomName: string, message: string) => void;
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

const Room = (room: RoomProps) => {
  const [textValue, setTextValue] = React.useState("");
  const socket = useContext(WebsocketContext);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [room.roomName]);

  const sendMessage = (event) => {
    event.preventDefault();
    room.onSendMessage(room.roomName, textValue);
    setTextValue("");
  };
  const currentUser = socket.id;
  const groupedMessages = groupMessages(room.messages);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  // When new messages are received, scroll to it
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedMessages]);

  return (
    <div className="room">
      <div className="chat-area">
        <div className="room-title">
          <h2>{room.roomName}</h2>
        </div>
        <div className="message-container">
          <div className="messages">
            {groupedMessages.map((message, index) => (
              <Message
                ref={
                  index === groupedMessages.length - 1 ? lastMessageRef : null
                }
                key={index}
                message={message}
                currentUser={currentUser}
              />
            ))}
          </div>
          <div className="input-chat-container">
            <form onSubmit={sendMessage}>
              <ResizableTextArea
                ref={messageInputRef}
                value={textValue}
                placeholder="You take the text, and you put it in the box."
                onChange={(event) => setTextValue(event.target.value)}
                onEnterPress={sendMessage}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
