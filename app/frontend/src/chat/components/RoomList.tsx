import React, { useEffect } from "react";
import "src/styles/chat/RoomList.css";
import { CreateRoomModal } from "../modals/CreateRoomModal";
import { Box, List } from "@mui/material";
import { useChatContext } from "../chat.context";

import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

import { socket } from "../../contexts/WebSocket.context";
import RoomContextMenu from "./RoomListContextMenu";
import RoomListItem from "./RoomListItem";
import { useRoomManager } from "../lib/roomManager";
import { DirectMessageModal } from "../modals/DirectMessageModal";
import { UserEntity, InviteUsersModal } from "../modals/InviteUsersModal";
import { JoinRoomModal } from "../modals/JoinRoomModal";

const RoomList: React.FC = () => {
  const {
    currentRoomName,
    setShowCreateRoomModal,
    setShowJoinRoomModal,
    contextMenuData,
    contextMenuPosition,
    contextMenuRoomsVisible,
    setContextMenuRoomsVisible,
    handleContextMenu,
    createNewRoom,
    leaveRoom,
    changeRoomStatus,
    /* Direct message */
    showDirectMessageModal,
    setShowDirectMessageModal,
    showCreateRoomModal,
    showJoinRoomModal,
    /* Invite users */
    showInviteUsersModal,
    setShowInviteUsersModal,
    joinRoom,
    selectRoom,
    showNewRoomSnackbar,
    setShowNewRoomSnackbar
  } = useChatContext();
  const { rooms } = useRoomManager();

  const [selectedUsers, setSelectedUsers] = React.useState<UserEntity[]>([]);
  const [availableUsers, setAvailableUsers] = React.useState<UserEntity[]>([]);

  // Emit a "listAvailableUsers" socket event when the roomName changes
  useEffect(() => {
    if (!showInviteUsersModal) return;
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

  /****************/
  /*   Snackbar   */
  /****************/
  const [addedRoomName, setAddedRoomName] = React.useState("");

  useEffect(() => {
    socket.on("addedToNewChatRoom", (room) => {
      console.log(`You have been added to a new chat room: ${room.name}`);
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
              <RoomListItem
                key={roomName}
                room={room}
                isSelected={currentRoomName === roomName}
                onRoomSelect={selectRoom}
                onContextMenu={handleContextMenu}
              />
            ))}
        </List>
      </Box>
      <RoomContextMenu
        contextMenuVisible={contextMenuRoomsVisible}
        setContextMenuVisible={setContextMenuRoomsVisible}
        position={contextMenuPosition}
        contextMenuData={contextMenuData}
        onLeaveRoom={leaveRoom}
        onInvitePeopleToRoom={handleInvitePeopleToRoom}
        onChangeRoomStatus={changeRoomStatus}
      />
      <DirectMessageModal
        showModal={showDirectMessageModal}
        closeModal={() => setShowDirectMessageModal(false)}
      />
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
