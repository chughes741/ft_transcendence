import { useEffect } from "react";
import { socket } from "src/contexts/WebSocket.context";
import { PageState } from "src/root.model";
import { ChatModelType, useChatModel } from "./chat.model";
import { MessageType } from "src/chat/components/Message";
import { ChatContext } from "src/chat/chat.context";
import { UserListItem } from "src/chat/components/Userlist";
import { useRootViewModelContext } from "src/root.context";

export type ChatRoomStatus = "PUBLIC" | "PRIVATE" | "PASSWORD" | "DIALOGUE";
export type ChatMemberRank = "USER" | "ADMIN" | "OWNER";

export type RoomMemberEntity = {
  roomName: string;
  user: UserListItem;
};

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
  users: { [key: string]: UserListItem };
};

export type DevError = {
  error: string;
};

export type CreateRoomRequest = {
  name: string;
  status: "PUBLIC" | "PRIVATE" | "PASSWORD";
  password: string;
  owner: string;
};

export class LeaveRoomRequest {
  roomName: string;
  username: string;
}

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
  const chatModel = useChatModel();
  const {
    tempUsername,
    setTempUsername,
    currentRoomName,
    setCurrentRoomName,
    setShowNewRoomSnackbar,
    rooms,
    setRooms,
    setCurrentRoomMessages,
    contextMenuData,
    setContextMenuRoomsVisible
  } = chatModel;

  const { pageState, setPageState } = useRootViewModelContext();

  /*******************************/
  /*   Wrapper State Functions   */
  /*******************************/

  // This function will be called when a room focus is changed.
  // If the previous room is the same as the current one, toggle the page state to PageState.Home
  const selectRoom = (roomName: string) => {
    if (currentRoomName === roomName && pageState === PageState.Chat) {
      console.log("selectRoom: Room is already selected. Toggling to Home.");
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
      username: messagePayload.username,
      roomId: messagePayload.roomName,
      content: messagePayload.content,
      timestamp_readable,
      timestamp,
      isOwn: messagePayload.username === tempUsername,
      displayUser: true,
      displayTimestamp: true,
      displayDate: true,
      avatar: rooms[messagePayload.roomName]?.avatars[messagePayload.username]
    };
  };

  /**********************/
  /*   Room Functions   */
  /**********************/

  // Add member to room
  const addMemberToRoom = (roomName: string, member: UserListItem) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        console.log("In addMemberToRoom, room not found: ", roomName);
        return newRooms;
      }
      newRooms[roomName].users[member.username] = member;
      return newRooms;
    });
  };

  const getChatRoomMembers = async (roomName: string) => {
    return new Promise<{ [key: string]: UserListItem }>((resolve) => {
      socket.emit(
        "listUsers",
        { chatRoomName: roomName },
        (users: UserListItem[]) => {
          const usersObj = users.reduce<{ [key: string]: UserListItem }>(
            (acc, user) => {
              acc[user.username] = user;
              return acc;
            },
            {}
          );
          resolve(usersObj);
        }
      );
    });
  };

  // Adds a new room to the rooms state variable
  const addChatRoom = async (
    chatRoomPayload: ChatRoomPayload
  ): Promise<RoomType> => {
    const userList = await getChatRoomMembers(chatRoomPayload.name);

    // Validate the payload
    if (!chatRoomPayload.name) {
      console.log("In addChatRoom, invalid payload: ", chatRoomPayload);
      return;
    }

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
        messages: [],
        lastActivity,
        hasUnreadMessages: false,
        avatars,
        users: userList
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
      } else {
        newRooms[roomName].messages.push(message);
        newRooms[roomName].latestMessage = message;
      }
      return newRooms;
    });
  };

  const addMessagesToRoom = (roomName: string, messages: MessageType[]) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        console.log("addMessageSSSSSSSToRoom: Room does not exist");
      } else {
        newRooms[roomName].messages.push(...messages);
        newRooms[roomName].latestMessage = messages[messages.length - 1];
      }
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
      const roomRequest: CreateRoomRequest = {
        name: roomName,
        status: roomStatus,
        password: roomPassword,
        owner: tempUsername
      };
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
            await addChatRoom(res as ChatRoomPayload);
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
          // FIXME: handle errors more gracefully
          alert((joinRoomRes as DevError).error);
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
      socket.emit(
        "leaveRoom",
        { roomName, username: tempUsername },
        (response: DevError | string) => {
          if (typeof response === "object" && response.error) {
            console.log("Error response from leave room: ", response.error);
            resolve(false);
          }
        }
      );
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        delete newRooms[roomName];
        return newRooms;
      });
      setContextMenuRoomsVisible(false);
      if (currentRoomName === roomName) {
        setCurrentRoomMessages([]);
        setCurrentRoomName("");
        setPageState(PageState.Home);
      }
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
      // TODO: implement the backend handler for this socket event
      // TODO: instead of sendin only the status, send the whole room object
      // TODO: if status is password, open a modal to ask for the password
      socket.emit(
        "updateChatRoom",
        { roomName, newStatus },
        (success: boolean) => {
          if (success) {
            setRooms((prevRooms) => {
              const newRooms = { ...prevRooms };
              newRooms[roomName].status = newStatus;
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
    if (username === "" || username === undefined)
      return Promise.resolve(false);
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
          joinRoom("test", "secret");
          resolve(true);
        }
      });
    });
  };

  const createUser = async (username: string): Promise<boolean> => {
    if (username === "" || username === undefined)
      return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
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

    socket.on("newMessage", (newMessage: MessagePayload): boolean => {
      console.log("Ding ding, you've got mail:", newMessage);

      const messageData = convertMessagePayloadToMessageType(newMessage);
      addMessageToRoom(newMessage.roomName, messageData);
      // TODO: Implement a callback in the backend to check if user has read the message
      return newMessage.roomName === currentRoomName;
    });

    socket.on("newChatRoomMember", (member: RoomMemberEntity) => {
      console.log("New room member: ", member.user);
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        // Protection, cause I'm apparently too dumb to send a message to
        // everyone except the sender from the backend...
        if (!prevRooms || !prevRooms[member.roomName]) return newRooms;
        newRooms[member.roomName] = prevRooms[member.roomName];
        newRooms[member.roomName].users[member.user.username] = member.user;
        return newRooms;
      });
    });

    socket.on(
      "chatRoomMemberLeft",
      ({ roomName, username }: LeaveRoomRequest) => {
        console.log(`User ${username} left room ${roomName}`);
        setRooms((prevRooms) => {
          const newRooms = { ...prevRooms };
          delete newRooms[roomName].users[username];
          return newRooms;
        });
      }
    );

    socket.on("chatRoomMemberKicked", (member: RoomMemberEntity) => {
      console.log("Room member kicked: ", member.user);
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        delete newRooms[member.roomName].users[member.user.username];
        return newRooms;
      });
    });

    socket.on("addedToNewChatRoom", (room) => {
      console.log(
        "You have been added to a new chat room, adding it to the list"
      );
      console.log(room);
      addChatRoom(room);
      setShowNewRoomSnackbar(true);
    });

    return () => {
      socket.off("newMessage");
      socket.off("newChatRoomMember");
      socket.off("addedToNewChatRoom");
      socket.off("chatRoomMemberLeft");
      socket.off("chatRoomMemberKicked");
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

  // FIXME: temporary addition for dev build to test user creation
  // If no user is logged in, try to create a temporary user
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

  // Select the current room only once the room is ready
  useEffect(() => {
    if (currentRoomName && rooms && rooms[currentRoomName]) {
      console.log(
        `selectRoom: Room ${currentRoomName} selected!: `,
        rooms[currentRoomName]
      );
      setCurrentRoomName(currentRoomName);
      setCurrentRoomMessages(rooms[currentRoomName].messages);
      setPageState(PageState.Chat);
    }
  }, [currentRoomName, rooms]);

  // Get the list of users in the current room
  useEffect(() => {
    if (
      rooms &&
      currentRoomName &&
      rooms[currentRoomName] &&
      rooms[currentRoomName].users &&
      Object.keys(rooms[currentRoomName].users).length === 0
    ) {
      socket.emit(
        "listUsers",
        { chatRoomName: currentRoomName },
        (users: UserListItem[]) => {
          console.log(`Users in room ${currentRoomName}: `, users);
          users.map((user) => {
            console.log(`Adding user to room ${currentRoomName}: `, user);
            addMemberToRoom(currentRoomName, user);
          });
        }
      );
    }
  }, [socket, currentRoomName, rooms]);

  return (
    <ChatContext.Provider
      value={{
        ...chatModel,
        joinRoom,
        sendRoomMessage,
        createNewRoom,
        leaveRoom,
        changeRoomStatus,
        selectRoom
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
