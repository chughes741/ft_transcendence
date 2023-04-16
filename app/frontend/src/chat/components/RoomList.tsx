import React, { useEffect, useState } from "react";
import "src/styles/chat/RoomList.css";
import { CreateRoomModal } from "../modals/CreateRoomModal";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";
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
import {
  ChatMemberRank,
  ChatRoomStatus,
  DevError,
  ListUsersRequest,
  RoomType
} from "../chat.types";
import { RoomPasswordModal } from "../modals/RoomPasswordModal";
import { useRootViewModelContext } from "../../root.context";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const RoomList: React.FC = () => {
  const { rooms } = useRoomManager();
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
  const { self } = useRootViewModelContext();

  const [selectedUsers, setSelectedUsers] = useState<UserEntity[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserEntity[]>([]);

  const [directMessagesVisible, setDirectMessagesVisible] = useState(false);
  const [chatRoomsVisible, setChatRoomsVisible] = useState(false);

  const directMessages = Object.entries(rooms)
    .filter(([, room]) => room.status === ChatRoomStatus.DIALOGUE)
    .map<[string, RoomType]>(([name, room]) => {
      const otherUser = Object.entries(room.users).find(
        ([, member]) => member.username !== self.username
      );
      return otherUser ? [otherUser[1].username, room] : [name, room];
    });

  const chatRooms = Object.entries(rooms).filter(
    ([, room]) => room.status !== ChatRoomStatus.DIALOGUE
  );

  const renderSection = (
    showSection: boolean,
    setShowSection: React.Dispatch<React.SetStateAction<boolean>>,
    title: string,
    roomsArray: [string, RoomType][]
  ) => (
    <>
      <ListItemButton onClick={() => setShowSection(!showSection)}>
        <ListItemText primary={title} />
        {showSection ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      {Object.entries(roomsArray).length > 0 && (
        <Collapse
          in={showSection}
          timeout="auto"
          unmountOnExit
        >
          <List
            component="div"
            disablePadding
          >
            {roomsArray.map(([roomName, room]) => (
              <RoomListItem
                key={roomName}
                room={room}
                isSelected={currentRoomName === roomName}
                onRoomSelect={selectRoom}
                onContextMenu={handleContextMenu}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );

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

  /****************/
  /*   Snackbar   */
  /****************/
  const [addedRoomName, setAddedRoomName] = useState("");

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
          {rooms && (
            <>
              {renderSection(
                directMessagesVisible,
                setDirectMessagesVisible,
                "Direct Messages",
                directMessages
              )}
              {renderSection(
                chatRoomsVisible,
                setChatRoomsVisible,
                "Chat Rooms",
                chatRooms
              )}
            </>
          )}
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
