import React from "react";
import { Box, Avatar } from "@mui/material";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import UserContextMenu from "./UserListContextMenu";
import {
  ChatMemberRank,
  ChatMemberStatus,
  UpdateChatMemberRequest,
  UserListItem
} from "../chat.types";
import { useChatContext } from "../chat.context";
import { useProfileViewModelContext } from "../../profile/profile.viewModel";
import { useRootViewModelContext } from "../../root.context";
import { PageState } from "../../root.model";
import { socket } from "../../contexts/WebSocket.context";

export interface UserListProps {
  userList: { [key: string]: UserListItem };
  handleClick: (e: React.MouseEvent, userData: UserListItem) => void;
}

export default function UserListView({ userList, handleClick }: UserListProps) {
  const {
    currentRoomName,
    contextMenuUsersPosition,
    contextMenuUsersVisible,
    contextMenuUsersData,
    setContextMenuUsersVisible
  } = useChatContext();

  const { setUser, addFriend } = useProfileViewModelContext();
  const { self, setPageState } = useRootViewModelContext();

  const onViewProfile = () => {
    console.log("View Profile");
    setUser(contextMenuUsersData.username);
    setPageState(PageState.Profile);
  };

  const onInviteToGame = () => {
    console.log("Invite to game");
    setPageState(PageState.Game);
  };

  const onSendDirectMessage = () => {
    console.log("Send Direct Message");
  };

  const onAddFriend = () => {
    console.log("Add friend");
    addFriend(self.username, contextMenuUsersData.username);
  };

  const onKickUser = (duration: number) => {
    console.log("Kick User");
  };

  const onBanUser = (duration: number) => {
    console.log("Ban User");
  };

  const onMuteUser = (duration: number) => {
    console.log("Mute User");
  };

  const onPromoteToAdmin = () => {
    // emit a "updateChatMemberStatus" event to the server, with the username and the new rank
    const req: UpdateChatMemberRequest = {
      queryingUser: self.username,
      usernameToUpdate: contextMenuUsersData.username,
      roomName: currentRoomName,
      status: ChatMemberStatus.OK,
      queryingMemberRank: ChatMemberRank.ADMIN,
      memberToUpdateRank: ChatMemberRank.ADMIN,
      duration: 0
    };
    console.log(req);

    socket.emit("updateChatMemberStatus", req, (res: any) => {
      console.log(res);
    });
    setContextMenuUsersVisible(false);
    console.log("Promote to Admin");
  };

  const onDemoteToUser = () => {
    // emit a "updateChatMemberStatus" event to the server, with the username and the new rank
    const req: UpdateChatMemberRequest = {
      queryingUser: self.username,
      usernameToUpdate: contextMenuUsersData.username,
      roomName: currentRoomName,
      status: ChatMemberStatus.OK,
      queryingMemberRank: ChatMemberRank.ADMIN,
      memberToUpdateRank: ChatMemberRank.USER,
      duration: 0
    };
    console.log(req);

    socket.emit("updateChatMemberStatus", req, (res: any) => {
      console.log(res);
    });
    setContextMenuUsersVisible(false);
    console.log("Promote to Admin");
  };

  // Find your own rank by looking for your username in the userlist
  const ownRank = userList[self.username]?.rank;

  return (
    <>
      <Box
        id="userlist-container"
        sx={{
          height: "100%",
          position: "fixed",
          right: "0",
          width: "16vw",
          wordWrap: "break-word"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "16vw",
            wordWrap: "break-word"
          }}
        >
          <Box
            sx={{
              minHeight: "5vh",
              backgroundColor: "rgb(31,31,31)"
            }}
          >
            <Box
              className="list-title"
              sx={{
                fontSize: "1rem",
                maxWidth: "16vw",
                display: "flex",
                alignItems: "center",
                height: "5vh"
              }}
            >
              <GroupIcon
                style={{ margin: "1rem" }}
                color="secondary"
              />
              <p>Members List</p>
            </Box>
          </Box>
          <Box
            id="members-container"
            style={{
              maxHeight: "75vh",
              overflowY: "auto",
              overflowX: "hidden"
            }}
          >
            {Object.keys(userList).length === 0 && <Box>No one in chat </Box>}

            <List>
              {userList &&
                Object.entries(userList).map(([username, user]) => (
                  <ListItemButton
                    onContextMenu={(e) => handleClick(e, user)}
                    key={user.username}
                    onClick={(e) => {
                      handleClick(e, user);
                    }}
                  >
                    <ListItemIcon>
                      <Avatar src={`https://i.pravatar.cc/150?u=${username}`} />
                    </ListItemIcon>
                    <ListItemText
                      primary={username}
                      secondary={user.userStatus}
                    />
                  </ListItemButton>
                ))}
            </List>
          </Box>
        </Box>
      </Box>
      <UserContextMenu
        ownRank={ownRank}
        contextMenuVisible={contextMenuUsersVisible}
        setContextMenuVisible={setContextMenuUsersVisible}
        position={contextMenuUsersPosition}
        contextMenuData={contextMenuUsersData}
        onViewProfile={onViewProfile}
        onInviteToGame={onInviteToGame}
        onSendDirectMessage={onSendDirectMessage}
        onAddFriend={onAddFriend}
        onKickUser={onKickUser}
        onBanUser={onBanUser}
        onMuteUser={onMuteUser}
        onPromoteToAdmin={onPromoteToAdmin}
        onDemoteToUser={onDemoteToUser}
      />
    </>
  );
}
