import React from "react";
import { Box } from "@mui/material";
import { Helmet } from "react-helmet";
import DevLoginBanner from "../../components/DevLoginBanner";
import RoomList from "./components/RoomList";
import ChatAreaView from "./components/ChatArea.view";
import { useChatViewModelContext } from "./contexts/ChatViewModelContext";

import UserList from "src/components/chat/UserList";


export const ChatView: React.FC = () => {
  const { currentRoomName, tempUsername, setTempUsername } =
    useChatViewModelContext();

  return (
    <Box
      id="chat-page-container"
      style={{ width: "100%", height: "100%", display: "flex" }}
    >
      <Box
        id="chat"
        style={{ width: "100%" }}
        sx={{ flexDirection: "column" }}
      >
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
          style={{ display: "flex", height: "80vh" }}
          sx={{ flexDirection: "row" }}
        >
          <Box
            id="chat-area"
            style={{ width: "80%" }}
          >
            <ChatAreaView key={currentRoomName} />
          </Box>
          <UserList chatRoomName = {currentRoomName} />
        </Box>
      </Box>
    </Box>
  );
};
