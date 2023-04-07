// ChatViewModel.tsx
import { useEffect } from "react";
import { usePageStateContext } from "../../contexts/PageStateContext";
import { socket } from "../../contexts/WebSocketContext";
import { PageState } from "../../views/root.model";
import { ChatModelType, useChatModel } from "./ChatModel";
import { MessageType } from "./components/Message";
import { ChatViewModelContext } from "./contexts/ChatViewModelContext";

export type ChatRoomStatus = "PUBLIC" | "PRIVATE" | "PASSWORD";
export type ChatMemberRank = "USER" | "ADMIN" | "OWNER";

export type MessagePayload = {
  username: string;
  roomName: string;
  content: string;
  timestamp: Date;
};

export interface ChatRoomPayload {
  name: string;
  status: ChatRoomStatus;
  queryingUserRank: ChatMemberRank;
  latestMessage?: MessagePayload;
  lastActivity: Date;
  avatars?: string[];
}

export type RoomType = {
  name: string;
  status: ChatRoomStatus;
  rank: ChatMemberRank;
  messages: MessageType[];
  latestMessage?: MessageType;
  lastActivity: Date;
  hasUnreadMessages: boolean;
  avatars?: string[];
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
  selectRoom: (roomName: string) => void;
}

export const ChatViewModelProvider = ({ children }) => {
  /***********************/
  /*   State Variables   */
  /***********************/
  const {
    tempUsername,
    setTempUsername,
    currentRoomName,
    setCurrentRoomName,
    rooms,
    setRooms,
    currentRoomMessages,
    setCurrentRoomMessages,
    contextMenuPosition,
    contextMenuData,
    handleContextMenu,
    contextMenuVisible,
    setContextMenuVisible,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    truncateText
  } = useChatModel();

  const { setPageState } = usePageStateContext();

  /*******************************/
  /*   Wrapper State Functions   */
  /*******************************/

  // This function will be called when a room focus is changed.
  // If the previous room is the same as the current one, toggle the page state to PageState.Home
  const selectRoom = (roomName: string) => {
    if (currentRoomName === roomName) {
      setCurrentRoomName("");
      setPageState(PageState.Home);
      return;
    }
    if (!rooms[roomName]) {
      return;
    }
    console.log(`selectRoom: Room ${roomName} selected! `, rooms[roomName]);
    setCurrentRoomName(roomName);
    setCurrentRoomMessages(rooms[roomName].messages);
    setPageState(PageState.Chat);
  };

  /**********************/
  /*   Util Functions   */
  /**********************/

  const convertMessagePayloadToMessageType = (
    messagePayload: MessagePayload
  ): MessageType => {
    const timestamp = new Date(messagePayload.timestamp);
    const timestamp_readable = timestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });

    return {
      user: messagePayload.username,
      roomId: messagePayload.roomName,
      content: messagePayload.content,
      timestamp_readable,
      timestamp,
      isOwn: messagePayload.username === tempUsername,
      displayUser: true,
      displayTimestamp: true,
      displayDate: true
    };
  };

  /**********************/
  /*   Room Functions   */
  /**********************/

  // Adds a new room to the rooms state variable
  const addChatRoom = async (
    chatRoomPayload: ChatRoomPayload
  ): Promise<RoomType> => {
    return new Promise<RoomType>((resolve) => {
      const {
        name,
        status,
        queryingUserRank,
        latestMessage,
        lastActivity,
        avatars
      } = chatRoomPayload;
      const convertedLatestMessage = latestMessage
        ? convertMessagePayloadToMessageType(latestMessage)
        : undefined;

      const newRoom = {
        name: name,
        status: status,
        rank: queryingUserRank,
        latestMessage: convertedLatestMessage,
        messages: convertedLatestMessage ? [convertedLatestMessage] : [],
        lastActivity,
        hasUnreadMessages: false,
        avatars
      };

      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };

        if (!newRooms[name]) {
          newRooms[name] = newRoom;
        }

        console.log("Added room to rooms: ", newRooms);

        resolve(newRoom);
        return newRooms;
      });
    });
  };

  // FIXME: move to model?
  const addMessageToRoom = (roomName: string, message: MessageType) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        console.log("addMessageToRoom: Room does not exist");
      } else newRooms[roomName].messages.push(message);
      return newRooms;
    });
  };

  const addMessagesToRoom = (roomName: string, messages: MessageType[]) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        console.log("addMessageSSSSSSSToRoom: Room does not exist");
      } else newRooms[roomName].messages.push(...messages);
      return newRooms;
    });
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
      let room: RoomType;
      console.log("ChatPage: Creating new room", { ...roomRequest });
      socket.emit(
        "createRoom",
        roomRequest,
        async (res: DevError | ChatRoomPayload) => {
          if ((res as DevError).error !== undefined) {
            console.log(
              "Error response from join room: ",
              (res as DevError).error
            );
            resolve(false);
          } else {
            // res is ChatRoomPayload
            console.log("Response from join room: ", res);
            room = await addChatRoom(res as ChatRoomPayload);
            resolve(true);
          }
        }
      );
    });
  };

  // Join a room
  const joinRoom = async (
    roomName: string,
    password: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      let room: RoomType;
      const joinRoomRes = new Promise<DevError | ChatRoomPayload>(
        (joinRoomResolve) => {
          socket.emit(
            "joinRoom",
            { roomName, password, user: tempUsername },
            (res: DevError | ChatRoomPayload) => {
              joinRoomResolve(res);
            }
          );
        }
      );

      joinRoomRes.then(async (joinRoomRes) => {
        if ((joinRoomRes as DevError).error !== undefined) {
          console.log(
            "Error response from join room: ",
            (joinRoomRes as DevError).error
          );
          resolve(false);
        } else {
          console.log("Response from join room: ", joinRoomRes);
          room = await addChatRoom(joinRoomRes as ChatRoomPayload);
          selectRoom(room.name);

          socket.emit(
            "getRoomMessagesPage",
            { roomName, date: new Date(), pageSize: 50 },
            (res: DevError | MessagePayload[]) => {
              if (res instanceof Array) {
                console.log("getRoomMessagesPage response: ", res);
                const messages = res.map((message) =>
                  convertMessagePayloadToMessageType(message)
                );
                console.log("Converted messages: ", messages);
                addMessagesToRoom(roomName, messages);
                setCurrentRoomName(roomName);
                console.log("Added messages to room: ", roomName);
                resolve(true);
              } else {
                console.log(
                  "Error response from get room messages: ",
                  res.error
                );
                resolve(false);
              }
            }
          );
        }
      });
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
    return new Promise<boolean>((resolve) => {
      socket.emit("userLogin", username, (response: DevError | string) => {
        if (typeof response === "object") {
          console.log("Error response from user login: ", response.error);
          resolve(false);
        } else {
          console.log(`Logged in user ${username} successfully!`);
          console.log("Success response from user login: ");
          console.log(response);
          setTempUsername(username);
          joinRoom("PublicRoom", "");
          joinRoom("PrivateRoom", "");
          joinRoom("PasswordProtectedRoom", "secret");
          resolve(true);
        }
      });
    });
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

    socket.on("onMessage", (newMessage: MessagePayload): boolean => {
      console.log("Ding ding, you've got mail:", newMessage);

      const messageData = convertMessagePayloadToMessageType(newMessage);
      addMessageToRoom(newMessage.roomName, messageData);
      // TODO: Implement a callback in the backend to check if user has read the message
      return newMessage.roomName === currentRoomName ? true : false;
    });

    return () => {
      socket.off("onMessage");
    };
  }, [socket, tempUsername]);

  /******************/
  /*   useEffects   */
  /******************/

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  useEffect(() => {
    if (socket && !tempUsername) {
      setTempUsername("temp_user");
    }
  }, [socket, ""]);

  // Select the current room only once the room is ready
  useEffect(() => {
    if (currentRoomName && rooms[currentRoomName]) {
      console.log(
        `selectRoom: Room ${currentRoomName} selected!: `,
        rooms[currentRoomName]
      );
      setCurrentRoomName(currentRoomName);
      setCurrentRoomMessages(rooms[currentRoomName].messages);
      setPageState(PageState.Chat);
    }
  }, [currentRoomName, rooms]);

  useEffect(() => {
    // Try to create a temporary user
    if (tempUsername) {
      setRooms(() => {
        return {};
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

  return (
    <ChatViewModelContext.Provider
      value={{
        tempUsername,
        setTempUsername,
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
        contextMenuData,
        contextMenuPosition,
        handleContextMenu,
        contextMenuVisible,
        setContextMenuVisible,
        unreadMessages,
        setUnreadMessages,
        truncateText,
        joinRoom,
        sendRoomMessage,
        createNewRoom,
        leaveRoom,
        changeRoomStatus,
        selectRoom
      }}
    >
      {children}
    </ChatViewModelContext.Provider>
  );
};
