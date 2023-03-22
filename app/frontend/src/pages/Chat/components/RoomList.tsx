import React, { useContext, useEffect } from "react";
import { ChatContext } from "./ChatContext";
import Button from "../../../components/Button";
import ButtonFunky from "../../../components/ButtonFunky";
import { WebSocketContext } from "../../../contexts/WebSocketContext";
import { MessageType } from "./Message";
import { MessagePayload } from "../ChatPage";
import ContextMenu from "./ContextMenu";
import { JoinRoomModal } from "./JoinRoomModal";
import { CreateRoomModal } from "./CreateRoomModal";

const RoomList: React.FC = () => {
  const {
    rooms,
    setRooms,
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

      console.log(
        `Sender is ${newMessage.sender} and tempUsername is ${tempUsername}`
      );
      console.log(
        `newMessage.sender === tempUsername ? ${
          newMessage.sender === tempUsername
        }`
      );

      const messageData: MessageType = {
        user: newMessage.sender,
        roomId: newMessage.roomName,
        message: newMessage.content,
        timestamp,
        isOwn: newMessage.sender === tempUsername,
        displayUser: true,
        displayTimestamp: true
      };
      console.log(`messageData: ${JSON.stringify(messageData)}`);
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
      <div> </div>
      <ButtonFunky
        content="Join Room"
        onClick={() => setShowJoinRoomModal(true)}
        width="100%"
      />
      <div> </div>
      {Object.entries(rooms).map(([roomId, messages]) => (
        <div
          key={roomId}
          className="room-item"
          onClick={() => {
            setCurrentRoomName(roomId);
            setCurrentRoomMessages(messages);
          }}
          onContextMenu={(e) => handleContextMenu(e, { name: roomId })}
        >
          <img
            src={`https://i.pravatar.cc/150?u=${roomId}`} // Use a random profile picture for each room
            alt="Profile"
          />
          <div className="room-info">
            <div className="room-name">{roomId}</div>
            <div className="last-message">
              {messages.length > 0 ? messages[messages.length - 1].message : ""}
            </div>
          </div>
        </div>
      ))}
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
          }
        ]}
      />
    </div>
  );
};

export default RoomList;
