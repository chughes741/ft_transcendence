import React from "react";
import { Box } from "@mui/material";
import { Helmet } from "react-helmet";
import DevLoginBanner from "../../components/DevLoginBanner";
import RoomList from "./components/RoomList";
import ChatAreaView from "./components/ChatArea.view";
import { useChatViewModelContext } from "./contexts/ChatViewModelContext";

export const ChatView: React.FC = () => {
  const { currentRoomName, tempUsername, setTempUsername } =
    useChatViewModelContext();

  return (
    <Box
      id="chat-page-container"
      style={{ width: "100vw", height: "100vh", display: "flex" }}
    >
      <Helmet>
        <title>King Pong | Chat</title>
      </Helmet>
      <Box
        id="chat"
        style={{ width: "100%" }}
        sx={{ flexDirection: "column" }}
      >
        <Box style={{ height: "64px" }}></Box>
        <Box
          id="login-banner"
          style={{ width: "100%" }}
        >
          <DevLoginBanner
            username={tempUsername}
            onLoginAsSomeoneElse={(username) => {
              setTempUsername(username);
            }}
          />
        </Box>
        <Box
          id="chat-reste"
          style={{ display: "flex", height: "88%" }}
          sx={{ flexDirection: "row" }}
        >
          <RoomList />
          <Box
            id="chat-area"
            style={{ width: "80%" }}
          >
            <ChatAreaView key={currentRoomName} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
