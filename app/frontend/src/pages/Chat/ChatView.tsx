import React from "react";
import { Box } from "@mui/material";
import { Helmet } from "react-helmet";
import DevLoginBanner from "../../components/DevLoginBanner";
import SideBar from "../../components/SideBar";
import RoomList from "./components/RoomList";
import ChatArea from "./components/ChatArea";
import { useChatViewModel } from "./ChatViewModel";

export const ChatView: React.FC = () => {
  const { currentRoomName, tempUsername, setTempUsername } = useChatViewModel();

  return (
    <Box
      id="chat-page-container"
      style={{ width: "100vw", height: "100vh", display: "flex" }}
    >
      <Helmet>
        <title>King Pong | Chat</title>
      </Helmet>
      <SideBar />
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
            <ChatArea key={currentRoomName} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
