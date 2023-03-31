// ChatViewModel.tsx
import { useEffect } from "react";
import { socket } from "../../contexts/WebSocketContext";
import { useChatModel } from "./ChatModel";
import { MessageType } from "./components/Message";

export type MessagePayload = {
  sender: string;
  roomName: string;
  content: string;
};

export type RoomType = {
  name: string;
};

export type DevError = {
  error: string;
};

export const useChatViewModel = () => {
  /***********************/
  /*   State Variables   */
  /***********************/
  const {
    currentRoomName,
    setCurrentRoomName,
    rooms,
    setRooms,
    currentRoomMessages,
    setCurrentRoomMessages,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    tempUsername,
    setTempUsername,
    contextMenuData,
    contextMenuVisible,
    setContextMenuVisible,
    contextMenuPosition,
    handleContextMenu
  } = useChatModel();

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

  const joinRoom = async (roomName, password) => {
    return new Promise((resolve) => {
      socket.emit(
        "joinRoom",
        { roomName, password, user: tempUsername },
        (res) => {
          if (typeof res === "object" && res.error) {
            resolve(false);
          }
        }
      );

      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        newRooms[roomName] = [];
        return newRooms;
      });

      setCurrentRoomName(roomName);
      resolve(true);
    });
  };

  const sendRoomMessage = (roomName, message) => {
    socket.emit("sendMessage", {
      sender: tempUsername,
      roomName: roomName,
      content: message
    });
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

  /**********************/
  /*   User Functions   */
  /**********************/

  const userLogin = async (username: string): Promise<boolean> => {
    let success = false;
    socket.emit("userLogin", username, (response: DevError | string) => {
      if (typeof response === "object") {
        console.log("Error response from user login: ", response.error);
      } else {
        console.log(`Logged in user ${username} successfully!`);
        console.log("Success response from user login: ");
        console.log(response);
        setTempUsername(username);
        joinRoom("PublicRoom", "");
        joinRoom("PrivateRoom", "");
        joinRoom("PasswordProtectedRoom", "secret");
        success = true;
      }
    });
    return success;
  };

  const createUser = async (username: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      socket.emit("userCreation", username, (response: DevError | string) => {
        if (typeof response === "object") {
          console.log("Error response from user creation: ", response.error);
          resolve(false);
          // Try to log in instead
        } else {
          setTempUsername(username);
          setRooms(null);
          console.log(`Created user ${username} successfully!`);

          // FIXME: For testing purposes only
          // Join three separate rooms on connection
          joinRoom("PublicRoom", "");
          joinRoom("PrivateRoom", "");
          joinRoom("PasswordProtectedRoom", "secret");
          joinRoom("PasswordProtectedRoomFromCreateUser", "secret");
          resolve(true);
        }
      });
    });
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

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  useEffect(() => {
    if (socket && !tempUsername) {
      setTempUsername("temp_user");
    }
  }, [socket, ""]);

  useEffect(() => {
    // Try to create a temporary user
    if (tempUsername) {
      const createTempUser = async (username: string) => {
        const userCreated = await createUser(username);
        if (!userCreated) {
          // Try to login instead
          const userLogged = await userLogin(username);
          if (!userLogged) {
            console.log("Failed to create or login to user", username);
          }
        }
      };

      createTempUser(tempUsername);
    }
  }, [tempUsername, ""]);

  return {
    currentRoomName,
    setCurrentRoomName,
    rooms,
    setRooms,
    currentRoomMessages,
    setCurrentRoomMessages,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    tempUsername,
    setTempUsername,
    contextMenuData,
    contextMenuVisible,
    setContextMenuVisible,
    contextMenuPosition,
    handleContextMenu,
    joinRoom,
    sendRoomMessage,
    createNewRoom,
    leaveRoom,
    changeRoomStatus
  };
};
