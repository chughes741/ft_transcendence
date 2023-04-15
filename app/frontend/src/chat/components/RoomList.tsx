import React, { useCallback, useEffect } from "react";
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
import { handleSocketErrorResponse } from "../lib/helperFunctions";
import { DevError, ListUsersRequest } from "../chat.types";
import { RoomPasswordModal } from "../modals/RoomPasswordModal";
import { ChooseUsernameModal } from "../../components/ChooseUsernameModal";
import { useRootViewModelContext } from "../../root.context";

const RoomList: React.FC = () => {
  const { rooms } = useRoomManager();
  const {
    /* Choose Username Modal */
    showChooseUsernameModal,
    setShowChooseUsernameModal,
    /* Confirmation Modal */
    setConfirmationCallback,
    setConfirmationMessage,
    showConfirmationModal,
    setShowConfirmationModal
  } = useRootViewModelContext();
  const {
    currentRoomName,
    /* Room fcts */
    createNewRoom,
    joinRoom,
    leaveRoom,
    changeRoomStatus,
    /* Context Menu */
    contextMenuRoomsVisible,
    setContextMenuRoomsVisible,
    /* Context Menu Data */
    contextMenuData,
    contextMenuPosition,
    /* DM Modal */
    showDirectMessageModal,
    setShowDirectMessageModal,
    /* Create Room Modal */
    showCreateRoomModal,
    setShowCreateRoomModal,
    /* Join Room Modal */
    showJoinRoomModal,
    setShowJoinRoomModal,
    /* Invite Users to Room Modal */
    showInviteUsersModal,
    setShowInviteUsersModal,
    /* Password prompt Modal */
    showPasswordModal,
    setShowPasswordModal,
    /* Snackbar */
    showNewRoomSnackbar,
    setShowNewRoomSnackbar,
    /* Util fcts */
    selectRoom,
    handleContextMenu
  } = useChatContext();

  const [username, setUsername] = React.useState<string>(null);
  const [selectedUsers, setSelectedUsers] = React.useState<UserEntity[]>([]);
  const [availableUsers, setAvailableUsers] = React.useState<UserEntity[]>([]);

  // Emit a "listAvailableUsers" socket event when the roomName changes
  useEffect(() => {
    if (!showInviteUsersModal || !contextMenuData?.name) return;
    console.log(
      "showInviteUsers Modal has been activated, so me too: ",
      contextMenuData?.name
    );

    const req: ListUsersRequest = { chatRoomName: contextMenuData.name };
    console.warn(
      `RoomList: Fetching available users for room ${contextMenuData.name}...`,
      req
    );
    socket.emit("listAvailableUsers", req, (users: DevError | UserEntity[]) => {
      if (handleSocketErrorResponse(users)) {
        const error = users as DevError;
        console.error(
          `RoomList: Error fetching the available users: ${error.error}`
        );
        return;
      }
      console.log("Available users: ", users);
      console.log("Current room name: ", currentRoomName);
      setAvailableUsers(users);
      setSelectedUsers([]);
    });
  }, [showInviteUsersModal]);

  const handleInvitePeopleToRoom = () => {
    setContextMenuRoomsVisible(false);
    setShowInviteUsersModal(true);
  };

  const onConfirmation = useCallback(
    (confirmed: boolean) => {
      console.log(`Username confirmed?: ${confirmed ? "Yes" : "No"}`);
      if (!confirmed) return;
      setShowConfirmationModal(false);
      // eslint-disable-next-line
      setConfirmationMessage("");
      setShowConfirmationModal(false);
      setShowChooseUsernameModal(!!confirmed);
    },
    [showConfirmationModal]
  );

  useEffect(() => {
    if (!username || username.length === 0) {
      return;
    }

    console.log("Picking username: ", username);
    socket.emit("pickUsername", username, (err: DevError | null) => {
      if (handleSocketErrorResponse(err)) {
        const error = err as DevError;
        console.error(`RoomList: Error picking username: ${error.error}`);
      }
      console.log("Username picked successfully");
    });
    // FIXME: move these calls back up inside the socket callback once "pickUsername" is implemented in the backend
    setConfirmationCallback(onConfirmation);
    setConfirmationMessage(
      `Are you sure you want to pick the username ${username}?
        This action cannot be reverted`
    );
    setShowConfirmationModal(true);
  }, [username]);

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
        onChangeRoomPassword={() => setShowPasswordModal(true)}
      />
      <ChooseUsernameModal
        showModal={showChooseUsernameModal}
        defaultUsername="schlurp"
        pickUsername={(username: string) => setUsername(username)}
      />
      <RoomPasswordModal
        showModal={showPasswordModal}
        closeModal={() => setShowPasswordModal(false)}
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
        roomName={contextMenuData?.name}
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
