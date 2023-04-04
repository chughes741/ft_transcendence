import React from "react";
import "../styles/RoomList.css";
import ButtonFunky from "../../../components/ButtonFunky";
import ContextMenu from "../../../components/ContextMenu";
import { JoinRoomModal } from "./JoinRoomModal";
import { CreateRoomModal } from "./CreateRoomModal";
import {
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
    setCurrentRoomName,
    setCurrentRoomMessages,
    setShowCreateRoomModal,
    setShowJoinRoomModal,
    contextMenuData,
    contextMenuPosition,
    handleContextMenu,
    truncateText,
    createNewRoom,
    leaveRoom,
    changeRoomStatus,
    showCreateRoomModal,
    showJoinRoomModal,
    joinRoom
  } = useChatViewModelContext();

  return (
    <div className="room-list">
      <ButtonFunky
        content="Create New Room"
        onClick={() => setShowCreateRoomModal(true)}
        width="100%"
      />
      <br />
      <ButtonFunky
        content="Join Room"
        onClick={() => setShowJoinRoomModal(true)}
        width="100%"
      />
      <br />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {Object.entries(rooms).map(([roomId, messages]) => (
            <ListItem
              key={roomId}
              onClick={() => {
                setCurrentRoomName(roomId);
                setCurrentRoomMessages(messages);
              }}
              onContextMenu={(e) => handleContextMenu(e, { name: roomId })}
            >
              <ListItemButton selected={currentRoomName === roomId}>
                <ListItemIcon>
                  <img
                    src={`https://i.pravatar.cc/150?u=${roomId}`}
                    alt="Profile"
                  />
                </ListItemIcon>
                <ListItemText
                  style={{ overflowX: "hidden" }}
                  primary={roomId}
                  secondary={
                    messages.length > 0
                      ? truncateText(messages[messages.length - 1].message, 42)
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
