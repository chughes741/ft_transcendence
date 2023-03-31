import React, { useContext, useEffect } from "react";
import { ChatContext } from "../contexts/ChatContext";
import "../styles/RoomList.css";
import ButtonFunky from "../../../components/ButtonFunky";
import { WebSocketContext } from "../../../contexts/WebSocketContext";
import { MessageType } from "./Message";
import { MessagePayload } from "../ChatPage";
import ContextMenu from "./ContextMenu";
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

const RoomList: React.FC = () => {
  const {
    rooms,
    setRooms,
    currentRoomName,
    contextMenuData,
    contextMenuPosition,
    setCurrentRoomName,
    setCurrentRoomMessages,
    setShowCreateRoomModal,
    setShowJoinRoomModal,
    setContextMenuVisible,
    showCreateRoomModal,
    showJoinRoomModal,
    handleContextMenu,
    joinRoom,
    tempUsername // FIXME: For testing purposes only
  } = useContext(ChatContext);

  const socket = useContext(WebSocketContext);

  /**********************/
  /*   Room Functions   */
  /**********************/

  const addMessageToRoom = (roomName: string, message: MessageType) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        newRooms[roomName] = [];
      }
      newRooms[roomName].push(message);
      return newRooms;
    });
  };

  const createNewRoom = (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD",
    password: string
  ) => {
    console.log(
      "ChatPage: Creating new room",
      roomName,
      roomStatus,
      password,
      tempUsername
    );
    const owner = tempUsername;
    socket.emit("createRoom", {
      name: roomName,
      status: roomStatus,
      password,
      owner
    });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      newRooms[roomName] = [];
      return newRooms;
    });
    setCurrentRoomName(roomName);
  };

  const leaveRoom = () => {
    if (!contextMenuData) return;
    const roomName = contextMenuData.name;
    socket.emit("leaveRoom", { roomName });
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      delete newRooms[roomName];
      return newRooms;
    });
    setContextMenuVisible(false);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 1) + "…";
  };

  const changeRoomStatus = (
    roomName: string,
    newStatus: "PRIVATE" | "PUBLIC" | "PASSWORD"
  ) => {
    console.log(`Changing room status of ${roomName} to ${newStatus}`);
    // Emit a socket event to change the room status, and listen for the callback.
    // If the callback is successful, update the room status in the state.
    // TODO: implement the backend handler for this socket event
    socket.emit(
      "changeRoomStatus",
      { roomName, newStatus },
      (success: boolean) => {
        if (success) {
          setRooms((prevRooms) => {
            const newRooms = { ...prevRooms };
            newRooms[roomName] = prevRooms[roomName];
            return newRooms;
          });
        }
      }
    );
  };

  /***********************/
  /*   Socket Listener   */
  /***********************/
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });

    socket.on("onMessage", (newMessage: MessagePayload) => {
      console.log("Ding ding, you've got mail:", newMessage);

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

      const messageData: MessageType = {
        user: newMessage.sender,
        roomId: newMessage.roomName,
        message: newMessage.content,
        timestamp,
        isOwn: newMessage.sender === tempUsername,
        displayUser: true,
        displayTimestamp: true
      };
      addMessageToRoom(newMessage.roomName, messageData);
    });

    return () => {
      socket.off("onMessage");
    };
  }, [socket, tempUsername]);

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
                    src={`https://i.pravatar.cc/150?u=${roomId}`} // Use a random profile picture for each room
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
        onCreateRoom={joinRoom}
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
