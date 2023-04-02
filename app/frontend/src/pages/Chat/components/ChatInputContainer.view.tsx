import { Box, TextareaAutosize } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";

const ChatInputContainerView = () => {
  const [textValue, setTextValue] = useState("");
  const { currentRoomName, sendRoomMessage } = useChatViewModelContext();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [currentRoomName]);

  const sendMessage = (event) => {
    event.preventDefault();
    const ret = sendRoomMessage(currentRoomName, textValue);
    if (!ret) alert(`Failed to send message to room ${currentRoomName}`);
    setTextValue("");
  };

  function onEnterPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  return (
    <Box>
      <form onSubmit={sendMessage}>
        <TextareaAutosize
          minRows={1}
          maxRows={12}
          ref={messageInputRef}
          value={textValue}
          placeholder="You take the text, and you put it in the box."
          onChange={(event) => setTextValue(event.target.value)}
          onKeyDown={onEnterPress}
          style={{ width: "100%", resize: "none", display: "block" }}
        />
      </form>
    </Box>
  );
};

export default ChatInputContainerView;