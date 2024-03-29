import React from "react";
import { Box } from "@mui/material";
import DevLoginBanner from "../components/DevLoginBanner";
import ChatAreaView from "./components/ChatArea";
import { useChatContext } from "./chat.context";
import UserListView from "./components/UserList";
import { useRoomManager } from "./lib/roomManager";
import { useRootViewModelContext } from "../root.context";
import { AuthRequest } from "./chat.types";

export const ChatView: React.FC = () => {
  const { currentRoomName, handleContextMenuUsers, chatGatewayLogin } =
    useChatContext();
  const { self } = useRootViewModelContext();
  const { rooms } = useRoomManager();

  const loginAsSomeoneElse = (newUsername: string) => {
    const req: AuthRequest = {
      username: newUsername,
      avatar: self.avatar
    };
    // Maybe needs to update the self.username upon connection for testing?
    chatGatewayLogin(req);
  };

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
          {/* FIXME: Disabled for submission */}
          {/* <DevLoginBanner
            username={self.username}
            onLoginAsSomeoneElse={loginAsSomeoneElse}
          /> */}
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
          <UserListView
            handleClick={handleContextMenuUsers}
            userList={
              !!rooms &&
              !!currentRoomName &&
              !!rooms[currentRoomName] &&
              !!rooms[currentRoomName].users &&
              rooms[currentRoomName].users
            }
          />
        </Box>
      </Box>
    </Box>
  );
};
