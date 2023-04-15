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
  DevError,
  UpdateChatMemberRequest,
  ChatMemberEntity,
  UNBAN_USER
} from "../chat.types";
import { useChatContext } from "../chat.context";
import { useProfileViewModelContext } from "../../profile/profile.viewModel";
import { useRootViewModelContext } from "../../root.context";
import { PageState } from "../../root.model";
import { socket } from "../../contexts/WebSocket.context";
import { handleSocketErrorResponse } from "../lib/helperFunctions";
import { useRoomManager } from "../lib/roomManager";
import UserListItem from "./UserListItem";
import { UserEntity } from "../modals/InviteUsersModal";

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
    setContextMenuUsersVisible
  } = useChatContext();
  const { updateRooms } = useRoomManager();

  const { setUser, addFriend } = useProfileViewModelContext();
  const { self, setPageState } = useRootViewModelContext();

  // Find your own rank by looking for your username in the userlist
  const ownRank = userList[self.username]?.rank;

  // Render sorted users
  const renderSortedUsers = (users: ChatMemberEntity[]) => {
    const sortedUsers = users.sort((a, b): number => {
      if (a.rank === "OWNER") return -1;
      if (b.rank === "OWNER") return 1;
      if (a.rank === "ADMIN") return -1;
      if (b.rank === "ADMIN") return 1;
      if (a.chatMemberStatus === ChatMemberStatus.MUTED) return 1;
      if (b.chatMemberStatus === ChatMemberStatus.MUTED) return -1;
      return a.username.localeCompare(b.username);
    });

    return sortedUsers.map((user) => (
      <UserListItem
        key={user.username}
        user={user}
      />
    ));
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
    console.log(req);

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

  const onBanUser = (duration: number, status = ChatMemberStatus.BANNED) => {
    sendUpdateRequest(duration, status, contextMenuUsersData.rank);
  };

  const onMuteUser = (duration: number, status = ChatMemberStatus.MUTED) => {
    duration === UNBAN_USER
      ? (status = ChatMemberStatus.OK)
      : (status = ChatMemberStatus.MUTED);
    sendUpdateRequest(duration, status, contextMenuUsersData.rank);
  };

  const onPromoteToAdmin = () => {
    sendUpdateRequest(0, ChatMemberStatus.OK, ChatMemberRank.ADMIN);
  };

  const onDemoteToUser = () => {
    // emit a "updateChatMemberStatus" event to the server, with the username and the new rank
    sendUpdateRequest(0, ChatMemberStatus.OK, ChatMemberRank.USER);
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
              {userList &&
                // Render the sorted users
                renderSortedUsers(Object.values(userList))}

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
        onBanUser={onBanUser}
        onMuteUser={onMuteUser}
        onPromoteToAdmin={onPromoteToAdmin}
        onDemoteToUser={onDemoteToUser}
      />
    </>
  );
}
