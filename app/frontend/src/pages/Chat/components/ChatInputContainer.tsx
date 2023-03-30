import { Box, TextareaAutosize } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import ChatContext from "./ChatContext";

const ChatInputContainer = () => {
  const [textValue, setTextValue] = useState("");
  const { currentRoomName, sendRoomMessage } = useContext(ChatContext);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

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
    <Box>
      <form onSubmit={sendMessage}>
        <TextareaAutosize
          minRows={1}
          maxRows={12}
          ref={messageInputRef}
          value={textValue}
          placeholder="You take the text, and you put it in the box."
          onChange={(event) => setTextValue(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage(event);
            }
          }}
          style={{ width: "100%", resize: "none", display: "block" }}
        />
      </form>
    </Box>
  );
};

export default ChatInputContainer;
