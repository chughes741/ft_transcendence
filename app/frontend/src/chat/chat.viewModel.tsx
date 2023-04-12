import { useEffect } from "react";
import { socket, useWebSocketContext } from "src/contexts/WebSocket.context";
import { PageState } from "src/root.model";
import { ChatModelType, useChatModel } from "./chat.model";
import { ChatContext } from "src/chat/chat.context";
import { useRootViewModelContext } from "../root.context";
import {
  DevError,
  UserListItem,
  ChatRoomPayload,
  ChatRoomStatus
} from "./chat.types";
import {
  handleChatRoomMemberLeftCreator,
  handleChatRoomMemberKickedCreator,
  handleConnectCreator,
  handleNewChatRoomMemberCreator,
  handleNewMessageCreator,
  handleAddedToNewChatRoomCreator
} from "./lib/socketHandler";
import { handleSocketErrorResponse } from "./lib/helperFunctions";
import { RoomManagerProvider, useRoomManager } from "./lib/roomManager";

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
  /*   Model Variables   */
  /***********************/
  const chatModel = useChatModel();
  const {
    tempUsername,
    setTempUsername,
    currentRoomName,
    setCurrentRoomName,
    setShowNewRoomSnackbar,
    setCurrentRoomMessages
  } = chatModel;

  const { pageState, setPageState } = useRootViewModelContext();

  /**********************/
  /*   Room Functions   */
  /**********************/

  const {
    rooms,
    setRooms,
    updateRooms,
    convertMessagePayloadToMessageType,
    addMemberToRoom,
    addChatRoom,
    addMessageToRoom,
    joinRoom,
    sendRoomMessage,
    createNewRoom,
    leaveRoom,
    changeRoomStatus
  } = useRoomManager();

  /**********************/
  /*   Util Functions   */
  /**********************/

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

  const setupSocketListeners = () => {
    // Create the actual handlers by invoking the higher-order functions
    const handleConnect = handleConnectCreator();
    const handleNewMessage = handleNewMessageCreator(
      addMessageToRoom,
      currentRoomName,
      convertMessagePayloadToMessageType
    );
    const handleNewChatRoomMember = handleNewChatRoomMemberCreator(updateRooms);
    const handleChatRoomMemberLeft =
      handleChatRoomMemberLeftCreator(updateRooms);
    const handleChatRoomMemberKicked =
      handleChatRoomMemberKickedCreator(updateRooms);
    const handleAddedToNewChatRoom = handleAddedToNewChatRoomCreator(
      addChatRoom,
      setShowNewRoomSnackbar
    );

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
