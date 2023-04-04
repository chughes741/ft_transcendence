// ChatViewModel.tsx
import { useEffect } from "react";
import { socket } from "../../contexts/WebSocketContext";
import { ChatModelType, useChatModel } from "./ChatModel";
import { MessageType } from "./components/Message";
import { ChatViewModelContext } from "./contexts/ChatViewModelContext";

export type ChatRoomStatus = "PUBLIC" | "PRIVATE" | "PASSWORD";

export type MessagePayload = {
  content: string;
  createdAt: Date;
  room: { name: string };
  sender: { username: string };
};

export interface ChatRoomPayload {
  name: string;
  status: ChatRoomStatus;
  latestMessage: MessagePayload;
  lastActivity: Date;
}

export type RoomType = {
  name: string;
};

export type DevError = {
  error: string;
};

export type CreateRoomType = {
  name: string;
  status: "PUBLIC" | "PRIVATE" | "PASSWORD";
  password: string;
  owner: string;
};

export interface ChatViewModelType extends ChatModelType {
  joinRoom: (roomName: string, password: string) => Promise<boolean>;
  sendRoomMessage: (roomName: string, message: string) => Promise<boolean>;
  createNewRoom: (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD",
    password: string
  ) => Promise<boolean>;
  leaveRoom: () => Promise<boolean>;
  changeRoomStatus: (
    roomName: string,
    newStatus: "PRIVATE" | "PUBLIC" | "PASSWORD"
  ) => Promise<boolean>;
}

export const ChatViewModelProvider = ({ children }) => {
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
    handleContextMenu,
    truncateText
  } = useChatModel();

  /**********************/
  /*   Room Functions   */
  /**********************/

  // FIXME: move to model?
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

  const addMessagesToRoom = (roomName: string, messages: MessageType[]) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        newRooms[roomName] = [];
      }
      newRooms[roomName].push(...messages);
      return newRooms;
    });
  };

  const convertMessagePayloadToMessageType = (
    messagePayload: MessagePayload
  ): MessageType => {
    const timestamp = new Date(messagePayload.createdAt);
    const timestamp_readable = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });

    return {
      user: messagePayload.sender.username,
      roomId: messagePayload.room.name,
      message: messagePayload.content,
      timestamp_readable,
      timestamp,
      isOwn: messagePayload.sender.username === tempUsername,
      displayUser: true,
      displayTimestamp: true,
      displayDate: true
    };
  };

  // Create a new room
  const createNewRoom = async (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD",
    roomPassword: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const roomRequest: CreateRoomType = {
        name: roomName,
        status: roomStatus,
        password: roomPassword,
        owner: tempUsername
      };

      console.log("ChatPage: Creating new room", { ...roomRequest });
      socket.emit("createRoom", roomRequest, (response: DevError | string) => {
        if (typeof response === "object" && response.error) {
          console.log("Error response from create room: ", response.error);
          resolve(false);
        }
      });

      // Will only reach this line if the socket callback is successful
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        newRooms[roomName] = [];
        return newRooms;
      });
      setCurrentRoomName(roomName);
      // setCurrentRoomMessages(rooms[roomName]);
      resolve(true);
    });
  };

  const leaveRoom = async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (!contextMenuData) return;
      const roomName = contextMenuData.name;
      socket.emit("leaveRoom", { roomName }, (response: DevError | string) => {
        if (typeof response === "object" && response.error) {
          console.log("Error response from leave room: ", response.error);
          resolve(false);
        }
      });
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        delete newRooms[roomName];
        return newRooms;
      });
      setContextMenuVisible(false);
      resolve(true);
    });
  };

  const joinRoom = async (
    roomName: string,
    password: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      socket.emit(
        "joinRoom",
        { roomName, password, user: tempUsername },
        // Socket callback
        (res: DevError | ChatRoomPayload) => {
          if ((res as DevError).error !== undefined) {
            console.log(
              "Error response from join room: ",
              (res as DevError).error
            );
          } else {
            // res is ChatRoomPayload
            console.log("Response from join room: ", res);
          }
        }
      );
      socket.emit(
        "getRoomMessagesPage",
        { roomName, date: new Date(), pageSize: 50 },
        (res: DevError | MessagePayload[]) => {
          if (res instanceof Array) {
            console.log("getRoomMessagesPage response: ", res);
            // Convert all the messages to MessageType, and add them to the room
            const messages = res.map((message) =>
              convertMessagePayloadToMessageType(message)
            );
            console.log("Converted messages: ", messages);
            addMessagesToRoom(roomName, messages);
            console.log("Added messages to room: ", roomName);
          } else {
            console.log("Error response from get room messages: ", res.error);
          }
        }
      );

      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        newRooms[roomName] = [];
        return newRooms;
      });

      setCurrentRoomName(roomName);
      // setCurrentRoomMessages(rooms[roomName]);
      resolve(true);
    });
  };

  const sendRoomMessage = async (
    roomName: string,
    message: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      socket.emit(
        "sendMessage",
        {
          sender: tempUsername,
          roomName: roomName,
          content: message
        },
        (res: DevError | string) => {
          if (typeof res === "object" && res.error) {
            console.log("Error response from send message: ", res.error);
            resolve(false);
          }
        }
      );
      resolve(true);
    });
  };

  const changeRoomStatus = async (
    roomName: string,
    newStatus: "PRIVATE" | "PUBLIC" | "PASSWORD"
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
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
          } else {
            console.log("Error changing room status");
            resolve(false);
          }
        }
      );
      resolve(true);
    });
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

      // const timestamp = newMessage.createdAt;
      // const timestamp_readable = new Date(timestamp).toLocaleTimeString(
      //   "en-US",
      //   {
      //     hour: "numeric",
      //     minute: "numeric",
      //     hour12: true
      //   }
      // );

      // const messageData: MessageType = {
      //   user: newMessage.sender.username,
      //   roomId: newMessage.room.name,
      //   message: newMessage.content,
      //   timestamp_readable,
      //   timestamp: new Date(timestamp),
      //   isOwn: newMessage.sender.username === tempUsername,
      //   displayUser: true,
      //   displayTimestamp: true,
      //   displayDate: true
      // };
      const messageData = convertMessagePayloadToMessageType(newMessage);
      addMessageToRoom(newMessage.room.name, messageData);
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
      setRooms((prevRooms) => {
        const newRooms = {};
        return newRooms;
      });
      const createTempUser = async (username: string): Promise<void> => {
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

  // Attempt at focusing the room messages when a new room is selected
  useEffect(() => {
    if (currentRoomMessages && rooms[currentRoomName]) {
      setCurrentRoomMessages(rooms[currentRoomName]);
    }
  }, [currentRoomMessages, ""]);

  return (
    <ChatViewModelContext.Provider
      value={{
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
        truncateText,
        joinRoom,
        sendRoomMessage,
        createNewRoom,
        leaveRoom,
        changeRoomStatus
      }}
    >
      {children}
    </ChatViewModelContext.Provider>
  );
};
