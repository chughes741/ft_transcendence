import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "./ChatContext";
import ResizableTextArea from "../../../components/ResizableTextArea";

const ChatInputContainer = () => {
  const [textValue, setTextValue] = useState("");
  const { currentRoomName, sendRoomMessage } = useContext(ChatContext);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [currentRoomName]);

  const sendMessage = (event) => {
    event.preventDefault();
    sendRoomMessage(currentRoomName, textValue);
    setTextValue("");
  };

  return (
    <div className="input-chat-container">
      <form
        className="form"
        onSubmit={sendMessage}
      >
        <ResizableTextArea
          ref={messageInputRef}
          value={textValue}
          placeholder="You take the text, and you put it in the box."
          onChange={(event) => setTextValue(event.target.value)}
          onEnterPress={sendMessage}
        />
      </form>
    </div>
  );
};

export default ChatInputContainer;
