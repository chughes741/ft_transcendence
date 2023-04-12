import { useEffect } from "react";
import { socket, useWebSocketContext } from "src/contexts/WebSocket.context";
import { PageState } from "src/root.model";
import { ChatModelType, useChatModel } from "./chat.model";
import { ChatContext } from "src/chat/chat.context";
import { useRootViewModelContext } from "../root.context";
import {
  DevError,
  MessagePayload,
  MessageType,
  UserListItem,
  ChatRoomPayload,
  RoomType,
  CreateRoomRequest,
  RoomMemberEntity,
  LeaveRoomRequest,
  ChatRoomStatus
} from "./chat.types";

export interface ChatViewModelType extends ChatModelType {
  joinRoom: (roomName: string, password: string) => Promise<boolean>;
  sendRoomMessage: (roomName: string, message: string) => Promise<boolean>;
  createNewRoom: (
    roomName: string,
    roomStatus: ChatRoomStatus,
    password: string
  ) => Promise<boolean>;
  leaveRoom: () => Promise<boolean>;
  changeRoomStatus: (newStatus: ChatRoomStatus) => Promise<boolean>;
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

  /**
   *
   * @param updateFn Callback function that takes in the previous rooms state and returns the new rooms state
   */
  const updateRooms = (updateFn) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      updateFn(newRooms);
      return newRooms;
    });
  };

  // Helper function to handle errors
  const handleSocketErrorResponse = (res: DevError | any): res is DevError => {
    return (res as DevError).error !== undefined;
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
      updateRooms((newRooms) => {
        if (!newRooms[name]) {
          newRooms[name] = newRoom;
        }
        console.log("Added room to rooms: ", newRooms);
        resolve(newRoom);
      });
    });
  };

  // FIXME: move to model?
  const addMessageToRoom = (roomName: string, message: MessageType) => {
    updateRooms((newRooms) => {
      if (!newRooms[roomName]) {
        console.log("addMessageToRoom: Room does not exist");
      } else {
        newRooms[roomName].messages.push(message);
        newRooms[roomName].latestMessage = message;
      }
    });
  };

  const addMessagesToRoom = (roomName: string, messages: MessageType[]) => {
    updateRooms((newRooms) => {
      if (!newRooms[roomName]) {
        console.log("addMessageSSSSSSSToRoom: Room does not exist");
      } else {
        newRooms[roomName].messages.push(...messages);
        newRooms[roomName].latestMessage = messages[messages.length - 1];
      }
    });
  };

  // Create a new room
  const createNewRoom = async (
    roomName: string,
    roomStatus: ChatRoomStatus,
    roomPassword?: string
  ): Promise<boolean> => {
    const roomRequest: CreateRoomRequest = {
      name: roomName,
      status: roomStatus,
      password: roomPassword,
      owner: tempUsername
    };
    console.log("ChatPage: Creating new room", { ...roomRequest });

    const response = await new Promise<DevError | ChatRoomPayload>((resolve) =>
      socket.emit("createRoom", roomRequest, resolve)
    );

    if (handleSocketErrorResponse(response)) {
      console.log("Error response from join room: ", response.error);
      return false;
    }

    await addChatRoom(response as ChatRoomPayload);
    return true;
  };

  // Join a room
  const joinRoom = async (
    roomName: string,
    password: string
  ): Promise<boolean> => {
    const joinRoomPayload = { roomName, password, user: tempUsername };
    const joinRoomRes = await new Promise<DevError | ChatRoomPayload>(
      (resolve) => socket.emit("joinRoom", joinRoomPayload, resolve)
    );

    if (handleSocketErrorResponse(joinRoomRes)) {
      console.log("Error response from join room: ", joinRoomRes.error);
      alert(joinRoomRes.error);
      return false;
    }

    const room = await addChatRoom(joinRoomRes as ChatRoomPayload);
    selectRoom(room.name);

    const messageRequest = { roomName, date: new Date(), pageSize: 50 };
    const messagesRes = await new Promise<DevError | MessagePayload[]>(
      (resolve) => socket.emit("getRoomMessagesPage", messageRequest, resolve)
    );

    if (handleSocketErrorResponse(messagesRes)) {
      console.log("Error response from get room messages: ", messagesRes.error);
      return false;
    }

    const messages = (messagesRes as MessagePayload[]).map((message) =>
      convertMessagePayloadToMessageType(message)
    );
    addMessagesToRoom(roomName, messages);
    setCurrentRoomName(roomName);

    return true;
  };

  const leaveRoom = async (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (!contextMenuData) return;
      const roomName = contextMenuData.name;
      socket.emit(
        "leaveRoom",
        { roomName, username: tempUsername },
        (response: DevError | string) => {
          if (handleSocketErrorResponse(response)) {
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
    newStatus: ChatRoomStatus
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const roomName = contextMenuData.name;
      console.log(`Changing room status of ${roomName} to ${newStatus}`);
      // TODO: instead of sending only the status, send the whole room object
      // TODO: if status is password, open a modal to ask for the password
      const newRoom = rooms[roomName];
      newRoom.status = newStatus;
      socket.emit(
        "updateChatRoom",
        { newRoom },
        (response: DevError | ChatRoomPayload) => {
          if (handleSocketErrorResponse(response)) {
            console.log("Error changing room status");
            resolve(false);
          }
          console.log("Successfully changed room status");
          updateRooms((newRooms) => {
            newRooms[roomName] = newRoom;
          });
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
  const { addSocketListener } = useWebSocketContext();

  // Define handlers
  const handleConnect = () => {
    console.log("Successfully connected to the server");
  };

  const handleNewMessage = (newMessage: MessagePayload): boolean => {
    console.log("Ding ding, you've got mail:", newMessage);
    const messageData = convertMessagePayloadToMessageType(newMessage);
    addMessageToRoom(newMessage.roomName, messageData);
    return newMessage.roomName === currentRoomName;
  };

  const handleNewChatRoomMember = (member: RoomMemberEntity) => {
    console.log("New room member: ", member.user);
    updateRooms((newRooms) => {
      if (!newRooms || !newRooms[member.roomName]) return newRooms;
      newRooms[member.roomName] = newRooms[member.roomName];
      newRooms[member.roomName].users[member.user.username] = member.user;
    });
  };

  const handleChatRoomMemberLeft = ({
    roomName,
    username
  }: LeaveRoomRequest) => {
    console.log(`User ${username} left room ${roomName}`);
    updateRooms((newRooms) => {
      delete newRooms[roomName].users[username];
    });
  };

  const handleChatRoomMemberKicked = (member: RoomMemberEntity) => {
    console.log("Room member kicked: ", member.user);
    updateRooms((newRooms) => {
      delete newRooms[member.roomName].users[member.user.username];
    });
  };

  const handleAddedToNewChatRoom = (room) => {
    console.log(
      "You have been added to a new chat room, adding it to the list"
    );
    console.log(room);
    addChatRoom(room);
    setShowNewRoomSnackbar(true);
  };

  // Setup socket listeners
  const setupSocketListeners = () => {
    addSocketListener("connect", handleConnect);
    addSocketListener("newMessage", handleNewMessage);
    addSocketListener("newChatRoomMember", handleNewChatRoomMember);
    addSocketListener("chatRoomMemberLeft", handleChatRoomMemberLeft);
    addSocketListener("chatRoomMemberKicked", handleChatRoomMemberKicked);
    addSocketListener("addedToNewChatRoom", handleAddedToNewChatRoom);
  };

  // Use effect for setting up and cleaning up listeners
  useEffect(() => {
    setupSocketListeners();
    return () => {
      socket.off("connect");
      socket.off("newMessage");
      socket.off("newChatRoomMember");
      socket.off("chatRoomMemberLeft");
      socket.off("chatRoomMemberKicked");
      socket.off("addedToNewChatRoom");
    };
  }, []);

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
