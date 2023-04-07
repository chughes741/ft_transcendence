import React from "react";
import "../styles/RoomList.css";
import ButtonFunky from "../../../components/ButtonFunky";
import ContextMenu from "../../../components/ContextMenu";
import { JoinRoomModal } from "./JoinRoomModal";
import { CreateRoomModal } from "./CreateRoomModal";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";

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
    joinRoom,
    selectRoom
  } = useChatViewModelContext();

  return (
    <div className="room-list">
      <Box sx={{ overflow: "auto" }}>
        <List>
          {Object.entries(rooms).map(([roomId, messages]) => (
            <ListItem
              key={roomId}
              onClick={() => selectRoom(roomId)}
              onContextMenu={(e) => handleContextMenu(e, { name: roomId })}
            >
              <ListItemButton selected={currentRoomName === roomId}>
                <ListItemIcon>
                  <Avatar
                    // className="room-list-avatar"
                    src={`https://i.pravatar.cc/150?u=${roomId}`}
                    alt="Profile"
                  />
                </ListItemIcon>
                <ListItemText
                  style={{ overflowX: "hidden" }}
                  primary={roomId}
                  secondary={
                    messages.length > 0
                      ? truncateText(messages[messages.length - 1].content, 42)
                      : ""
                  }
                />
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
            label: "Change Room Status",
            submenu: [
              {
                label: "Private",
                onClick: () => {
                  if (contextMenuData) {
                    changeRoomStatus(contextMenuData.name, "PRIVATE");
                  }
                }
              },
              {
                label: "Public",
                onClick: () => {
                  if (contextMenuData) {
                    changeRoomStatus(contextMenuData.name, "PUBLIC");
                  }
                }
              },
              {
                label: "Password Protected",
                onClick: () => {
                  if (contextMenuData) {
                    changeRoomStatus(contextMenuData.name, "PASSWORD");
                  }
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

export default RoomList;
