import React, { useState } from "react";
import { Box, Collapse } from "@mui/material";
import { List, ListItemText, ListItemButton } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import UserContextMenu from "./UserListContextMenu";
import {
  ChatMemberRank,
  ChatMemberStatus,
  DevError,
  UpdateChatMemberRequest,
  ChatMemberEntity,
  KickMemberRequest
} from "../chat.types";
import { useChatContext } from "../chat.context";
import { useProfileViewModelContext } from "../../profile/profile.viewModel";
import { useRootViewModelContext } from "../../root.context";
import { PageState } from "../../root.model";
import { socket } from "../../contexts/WebSocket.context";
import { handleSocketErrorResponse } from "../lib/helperFunctions";
import { useRoomManager } from "../lib/roomManager";
import UserListItem from "./UserListItem";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export interface UserListProps {
  userList: { [key: string]: ChatMemberEntity };
  handleClick: (e: React.MouseEvent, userData: ChatMemberEntity) => void;
}

export default function UserListView({ userList, handleClick }: UserListProps) {
  const {
    currentRoomName,
    contextMenuUsersPosition,
    contextMenuUsersVisible,
    contextMenuUsersData,
    setCurrentRoomName,
    setContextMenuUsersPosition,
    setContextMenuUsersData,
    setContextMenuUsersVisible,

    sendRoomMessage
  } = useChatContext();

  const { sendDirectMessage } = useChatContext();
  const { updateRooms } = useRoomManager();
  const { setUser, addFriend } = useProfileViewModelContext();
  const { self, setPageState } = useRootViewModelContext();

  // Find your own rank by looking for your username in the userlist
  const ownRank = userList[self.username]?.rank;
  const [bannedUsersVisible, setBannedUsersVisible] = useState(false);

  let sortedUsers: ChatMemberEntity[] = [];
  let bannedUsers: ChatMemberEntity[] = [];

  const sortUsers = () => {
    if (Object.values(userList).length === 0) return [];
    const users = Object.values(userList);
    console.log(`renderSortedUsers: ${users.length} users`);
    console.log(users);
    if (users.length === 0) return null;

    const filteredUsers = users.filter(
      (user) => user.chatMemberStatus !== ChatMemberStatus.BANNED
    );
    sortedUsers = filteredUsers.sort((a, b): number => {
      if (a.rank === "OWNER") return -1;
      if (b.rank === "OWNER") return 1;
      if (a.rank === "ADMIN") return -1;
      if (b.rank === "ADMIN") return 1;
      if (a.chatMemberStatus === ChatMemberStatus.MUTED) return 1;
      if (b.chatMemberStatus === ChatMemberStatus.MUTED) return -1;
      return a.username.localeCompare(b.username);
    });
    return sortedUsers;
  };

  const sortBannedUsers = () => {
    if (Object.values(userList).length === 0) return [];
    bannedUsers = Object.values(userList).filter(
      (user) => user.chatMemberStatus === ChatMemberStatus.BANNED
    );

    if (bannedUsers.length === 0) return null;
    return bannedUsers;
  };

  // Render sorted users
  const renderSortedUsers = () => {
    sortUsers();
    if (sortedUsers.length === 0) return null;
    return sortedUsers.map((user) => (
      <UserListItem
        key={user.username}
        user={user}
      />
    ));
  };

  const renderBannedUsersSection = () => {
    sortBannedUsers();
    if (bannedUsers.length === 0) return null;
    return (
      <>
        <ListItemButton
          onClick={() => setBannedUsersVisible(!bannedUsersVisible)}
        >
          <ListItemText primary="Banned Users" />
          {bannedUsersVisible ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        {bannedUsers.length > 0 && (
          <Collapse
            in={bannedUsersVisible}
            timeout="auto"
            unmountOnExit
          >
            <List
              component="div"
              disablePadding
            >
              {bannedUsers.map((user) => (
                <UserListItem
                  key={user.username}
                  user={user}
                />
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  };

  const sendUpdateRequest = (
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    duration: number = -1,
    newStatus: ChatMemberStatus = contextMenuUsersData.chatMemberStatus,
    newRank: ChatMemberRank = contextMenuUsersData.rank
  ) => {
    const req: UpdateChatMemberRequest = {
      queryingUser: self.username,
      usernameToUpdate: contextMenuUsersData.username,
      roomName: currentRoomName,
      status: newStatus,
      queryingMemberRank: ownRank,
      memberToUpdateRank: newRank,
      duration
    };
    console.log("Updating chat member...", req);

    socket.emit("updateChatMemberStatus", req, (res: DevError | any) => {
      if (handleSocketErrorResponse(res)) return console.error(res);
      console.log(`successfully updated user ${res}`);
      updateRooms((newRooms) => {
        const newUser =
          newRooms[currentRoomName].users[contextMenuUsersData.username];
        newUser.chatMemberStatus = newStatus;
        newUser.rank = newRank;
        newRooms[currentRoomName].users[contextMenuUsersData.username] =
          newUser;
        return newRooms;
      });
    });
    setContextMenuUsersVisible(false);
    setContextMenuUsersData({} as ChatMemberEntity);
    setContextMenuUsersPosition({ x: 0, y: 0 });
  };

  const onViewProfile = () => {
    console.log("View Profile");
    setUser(contextMenuUsersData.username);
    setPageState(PageState.Profile);
    setContextMenuUsersVisible(false);
  };

  const onInviteToGame = () => {
    console.log("Invite to game");
    setPageState(PageState.Game);
    setCurrentRoomName("");
    setContextMenuUsersVisible(false);
  };

  const onSendDirectMessage = () => {
    console.log("Send Direct Message");
    setContextMenuUsersVisible(false);
    sendDirectMessage(contextMenuUsersData.username);
  };

  const onAddFriend = () => {
    console.log("Add friend");
    addFriend(self.username, contextMenuUsersData.username);
    setContextMenuUsersVisible(false);
  };

  const onKickUser = () => {
    console.log("Kick User");
    const req: KickMemberRequest = {
      memberToKickUsername: contextMenuUsersData.username,
      memberToKickRank: contextMenuUsersData.rank,
      roomName: currentRoomName,
      queryingMemberRank: ownRank
    };

    socket.emit("kickUser", req, (res: DevError | any) => {
      if (handleSocketErrorResponse(res)) return console.error(res);
      console.log(`successfully kicked user ${res}`);
      updateRooms((newRooms) => {
        if (!newRooms[currentRoomName].users[res]) return newRooms;
        delete newRooms[currentRoomName].users[res];
        return newRooms;
      });
    });

    setContextMenuUsersVisible(false);
  };

  const onPromoteToAdmin = () => {
    sendUpdateRequest(0, ChatMemberStatus.OK, ChatMemberRank.ADMIN);
    setContextMenuUsersVisible(false);
  };

  const onDemoteToUser = () => {
    // emit a "updateChatMemberStatus" event to the server, with the username and the new rank
    sendUpdateRequest(0, ChatMemberStatus.OK, ChatMemberRank.USER);
    setContextMenuUsersVisible(false);
  };

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
              {userList && renderSortedUsers()}
              {userList && renderBannedUsersSection()}
              {/* Object.entries(userList).map(([username, user]) => (
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
               ))} */}
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
        sendUpdateRequest={sendUpdateRequest}
        onPromoteToAdmin={onPromoteToAdmin}
        onDemoteToUser={onDemoteToUser}
      />
    </>
  );
}
