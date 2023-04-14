import React, { useState, useRef, useEffect } from "react";
import { Box, TextareaAutosize, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useChatContext } from "../chat.context";

const ChatInputContainerView = () => {
  const [textValue, setTextValue] = useState("");
  const { currentRoomName, sendRoomMessage } = useChatContext();
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
    <Box
      sx={{
        paddingRight: "15%", // Add paddingRight and paddingLeft
        paddingLeft: "15%",
        paddingBottom: "10px",
        paddingTop: "10px"
      }}
    >
      <form onSubmit={sendMessage}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: "25px",
            border: "1px solid #ccc",
            backgroundColor: "#1a1a1a",
            padding: "10px"
          }}
        >
          <TextareaAutosize
            minRows={1}
            maxRows={12}
            ref={messageInputRef}
            value={textValue}
            placeholder="You take the text, and you put it in the box."
            onChange={(event) => setTextValue(event.target.value)}
            onKeyDown={onEnterPress}
            style={{
              width: "100%",
              resize: "none",
              display: "block",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "white",
              fontSize: "1rem",
              fontFamily: "Raleway, sans-serif"
            }}
          />
          <IconButton
            type="submit"
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </form>
    </Box>
  );
};

export default ChatInputContainerView;
