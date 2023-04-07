import React from "react";
import "../styles/RoomList.css";
import ContextMenu from "../../../components/ContextMenu";
import { JoinRoomModal } from "./JoinRoomModal";
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
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";
import { FaCrown, FaGlobe, FaLock, FaUserLock } from "react-icons/fa";

import { ChatRoomStatus } from "../ChatViewModel";

const RoomList: React.FC = () => {
  const {
    rooms,
    currentRoomName,
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
    joinRoom,
    selectRoom
  } = useChatViewModelContext();

  const isOwner = true;

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

  return (
    <div className="room-list">
      <Box sx={{ overflow: "auto" }}>
        <List>
          {Object.entries(rooms).map(([roomName, room]) => (
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
                    {room.avatars?.map((avatar, index) => (
                      <Avatar
                        key={index}
                        src={avatar}
                        alt={`Profile ${index}`}
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
                          room.messages[room.messages.length - 1].content,
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
      <ContextMenu
        position={contextMenuPosition}
        options={[
          {
            label: "Leave Room",
            onClick: leaveRoom
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
              ]
            : [])
        ]}
      />
    </div>
  );
};

export default RoomList;
