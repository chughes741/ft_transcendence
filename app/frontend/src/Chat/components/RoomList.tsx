import React, { useEffect } from "react";
import "src/styles/chat/RoomList.css";
import ContextMenu from "../../components/ContextMenu";
import { JoinRoomModal, UserEntity } from "./JoinRoomModal";
import { CreateRoomModal } from "./CreateRoomModal";
import {
  Avatar,
  AvatarGroup,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { useChatContext } from "../Chat.context";
import { FaCrown, FaGlobe, FaLock, FaUserLock } from "react-icons/fa";

import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

import { ChatRoomStatus } from "../Chat.viewModel";
import { socket } from "../../contexts/WebSocket.context";
import { InviteUsersModal } from "./InviteUsersModal";

const RoomList: React.FC = () => {
  const {
    rooms,
    currentRoomName,
    setShowCreateRoomModal,
    setShowJoinRoomModal,
    contextMenuData,
    contextMenuPosition,
    contextMenuRoomsVisible,
    setContextMenuRoomsVisible,
    handleContextMenu,
    truncateText,
    createNewRoom,
    leaveRoom,
    changeRoomStatus,
    showCreateRoomModal,
    showJoinRoomModal,
    showInviteUsersModal,
    setShowInviteUsersModal,
    joinRoom,
    selectRoom,
    showNewRoomSnackbar,
    setShowNewRoomSnackbar
  } = useChatContext();

  const [selectedUsers, setSelectedUsers] = React.useState<UserEntity[]>([]);
  const [availableUsers, setAvailableUsers] = React.useState<UserEntity[]>([]);

  // Make a useEffect to emit a "listAvailableUsers" socket event when the roomName changes
  useEffect(() => {
    console.log("Room name changed: ", currentRoomName);

    socket.emit(
      "listAvailableUsers",
      currentRoomName,
      (users: UserEntity[]) => {
        console.log("Available users: ", users);
        console.log("Current room name: ", currentRoomName);
        setAvailableUsers(users);
        setSelectedUsers([]);
      }
    );
  }, [currentRoomName]);

  const handleInvitePeopleToRoom = () => {
    setContextMenuRoomsVisible(false);
    setShowInviteUsersModal(true);
  };

  /******************/
  /*   Room Icons   */
  /******************/
  const getStatusIcon = (status: ChatRoomStatus) => {
    switch (status) {
      case "PASSWORD":
        return <FaLock />;
      case "PUBLIC":
        return <FaGlobe />;
      case "PRIVATE":
        return <FaUserLock />;
      default:
        return null;
    }
  };

  /****************/
  /*   Snackbar   */
  /****************/
  const [addedRoomName, setAddedRoomName] = React.useState("");

  useEffect(() => {
    socket.on("addedToNewChatRoom", (room) => {
      console.log(
        "*****************************************in RoomList, new room added: "
      );
      console.log(room);
      setAddedRoomName(room.name);
    });
  }, [socket]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setShowNewRoomSnackbar(false);
  };

  return (
    <div className="room-list">
      <Box sx={{ overflow: "auto" }}>
        <List>
          {rooms &&
            Object.entries(rooms).map(([roomName, room]) => (
              <ListItem
                key={roomName}
                onClick={() => selectRoom(roomName)}
                onContextMenu={(e) => handleContextMenu(e, room)}
              >
                <ListItemButton selected={currentRoomName === roomName}>
                  <span style={{ marginRight: "auto", marginLeft: "8px" }}>
                    {room.rank === "OWNER" && <FaCrown />}
                  </span>
                  <ListItemIcon>
                    <AvatarGroup
                      max={4}
                      spacing="small"
                    >
                      {room.users &&
                        Object.keys(room.users).length > 0 &&
                        Object.values(room.users).map((user) => (
                          <Avatar
                            key={user.username}
                            src={user.avatar}
                            alt={`Profile ${user.username}`}
                          />
                        ))}
                    </AvatarGroup>
                  </ListItemIcon>
                  <ListItemText
                    style={{ overflowX: "hidden" }}
                    primary={roomName}
                    secondary={
                      room.messages.length > 0
                        ? truncateText(
                            room?.messages[room.messages.length - 1]?.content,
                            42
                          )
                        : ""
                    }
                  />
                  <span style={{ marginLeft: "auto", marginRight: "16px" }}>
                    {getStatusIcon(room.status)}
                  </span>
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Box>
      <CreateRoomModal
        showModal={showCreateRoomModal}
        closeModal={() => setShowCreateRoomModal(false)}
        onCreateRoom={createNewRoom}
      />
      <JoinRoomModal
        showModal={showJoinRoomModal}
        closeModal={() => setShowJoinRoomModal(false)}
        onJoinRoom={joinRoom}
      />
      <InviteUsersModal
        showModal={showInviteUsersModal}
        closeModal={() => setShowInviteUsersModal(false)}
        availableUsers={availableUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
      <ContextMenu
        contextMenuVisible={contextMenuRoomsVisible}
        setContextMenuVisible={setContextMenuRoomsVisible}
        position={contextMenuPosition}
        options={[
          {
            label: "Leave Room",
            onClick: leaveRoom
          },
          {
            label: "Invite Users to Room",
            onClick: handleInvitePeopleToRoom
          },
          ...(contextMenuData && contextMenuData.rank === "OWNER"
            ? [
                {
                  label: "Change Room Status",
                  submenu: [
                    {
                      label: "Private",
                      onClick: () => {
                        if (contextMenuData) {
                          changeRoomStatus(
                            contextMenuData.name,
                            "PRIVATE"
                          ).then();
                        }
                      }
                    },
                    {
                      label: "Public",
                      onClick: () => {
                        if (contextMenuData) {
                          changeRoomStatus(
                            contextMenuData.name,
                            "PUBLIC"
                          ).then();
                        }
                      }
                    },
                    {
                      label: "Password Protected",
                      onClick: () => {
                        if (contextMenuData) {
                          changeRoomStatus(
                            contextMenuData.name,
                            "PASSWORD"
                          ).then();
                        }
                      }
                    }
                  ]
                }
              ]
            : [])
        ]}
      />
      <Snackbar
        open={showNewRoomSnackbar}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          You have been added to the room {addedRoomName}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RoomList;
