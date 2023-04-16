import { useEffect } from "react";
import { socket, useWebSocketContext } from "src/contexts/WebSocket.context";
import { PageState } from "src/root.model";
import { ChatModelType, useChatModel } from "./chat.model";
import { ChatContext } from "src/chat/chat.context";
import { useRootViewModelContext } from "../root.context";
import {
  DevError,
  ChatRoomStatus,
  AuthRequest,
  LeaveRoomRequest,
  SendDirectMessageRequest,
  ChatRoomPayload,
  ChatMemberRank
} from "./chat.types";
import {
  handleChatRoomMemberLeftCreator,
  handleChatRoomMemberKickedCreator,
  handleConnectCreator,
  handleNewChatRoomMemberCreator,
  handleNewMessageCreator,
  handleAddedToNewChatRoomCreator
} from "./lib/socketHandler";
import { useRoomManager } from "./lib/roomManager";
import { handleSocketErrorResponse } from "./lib/helperFunctions";

export interface ChatViewModelType extends ChatModelType {
  joinRoom: (roomName: string, password: string) => Promise<boolean>;
  sendDirectMessage: (username: string) => Promise<boolean>;
  sendRoomMessage: (roomName: string, message: string) => Promise<boolean>;
  createNewRoom: (
    roomName: string,
    roomStatus: ChatRoomStatus,
    password: string
  ) => Promise<boolean>;
  leaveRoom: () => void;
  changeRoomStatus: (newStatus: ChatRoomStatus) => Promise<boolean>;
  selectRoom: (roomName: string) => void;
}

export const ChatViewModelProvider = ({ children }) => {
  /***********************/
  /*   Model Variables   */
  /***********************/
  const chatModel = useChatModel();
  const {
    currentRoomName,
    setCurrentRoomName,
    setCurrentRoomMessages,
    contextMenuData,
    setContextMenuRoomsVisible,
    setShowNewRoomSnackbar,
    setShowPasswordModal,
    setNewRoomStatus
  } = chatModel;

  const { self, pageState, setPageState } = useRootViewModelContext();

  /**********************/
  /*   Room Variables   */
  /**********************/

  const {
    rooms,
    setRooms,
    updateRooms,
    convertMessagePayloadToMessageType,
    addChatRoom,
    addMessageToRoom,
    handleJoinRoom: joinRoom,
    handleSendRoomMessage: sendRoomMessage,
    handleCreateNewRoom: createNewRoom,
    handleChangeRoomStatus
  } = useRoomManager();

  /**********************/
  /*   Util Functions   */
  /**********************/

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
    updateRooms((newRooms) => {
      newRooms[roomName].hasUnreadMessages = false;
      newRooms[roomName].unreadMessagesCount = 0;
    });
    setPageState(PageState.Chat);
  };

  /**********************/
  /*   Room Functions   */
  /**********************/
  const changeRoomStatus = async (
    newStatus: ChatRoomStatus
  ): Promise<boolean> => {
    setContextMenuRoomsVisible(false);
    const roomName = contextMenuData.name;

    if (roomName === "" || roomName === undefined) return false;
    if (
      newStatus === ChatRoomStatus.PASSWORD ||
      contextMenuData.status === ChatRoomStatus.PASSWORD
    ) {
      setNewRoomStatus(newStatus);
      setShowPasswordModal(true);
    } else {
      if ((await handleChangeRoomStatus(roomName, newStatus)) === false)
        return false;
    }
    return true;
  };

  const leaveRoom = async (): Promise<boolean> => {
    const roomName = contextMenuData.name;

    console.log("Leaving room: ", roomName);

    return new Promise<boolean>((resolve) => {
      setContextMenuRoomsVisible(false);
      const req: LeaveRoomRequest = {
        roomName: roomName,
        username: self.username
      };
      console.log("Leaving room: ", req);
      socket.emit("leaveRoom", req, (response: DevError | string) => {
        if (handleSocketErrorResponse(response)) {
          console.log("Error response from leave room: ", response.error);
          resolve(false);
        }
      });
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        delete newRooms[roomName];
        return newRooms;
      });
      resolve(true);
    });
  };

  // Create a function sendDirectMessage that will take in a username, and check
  // if a direct message room exists with that user. If it does, it will select
  // that room. If it doesn't, it will create a new room with that user by sending
  // a request to the server. The server will send back a response with the room name
  const sendDirectMessage = async (username: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const req: SendDirectMessageRequest = {
        sender: self.username,
        recipient: username,
        senderRank: ChatMemberRank.USER
      };
      console.log("Sending direct message: ", req);

      socket.emit(
        "sendDirectMessage",
        req,
        (response: ChatRoomPayload | DevError) => {
          if (handleSocketErrorResponse(response)) {
            console.log(
              "Error response from send direct message: ",
              response.error
            );
            resolve(false);
          } else {
            console.log(
              "Success response from send direct message: ",
              response
            );
            addChatRoom(response);
            resolve(true);
          }
        }
      );
    });
  };

  /**********************/
  /*   User Functions   */
  /**********************/

  const userLogin = async (req: AuthRequest): Promise<boolean> => {
    if (!req || !req.username || req.username === "")
      return Promise.resolve(false);

    return new Promise<boolean>((resolve) => {
      socket.emit("userLogin", req, (response: DevError | string) => {
        if (typeof response === "object") {
          console.log("Error response from user login: ", response.error);
          resolve(false);
        } else {
          console.log(`Logged in user ${req.username} successfully!`);
          console.log("Success response from user login: ");
          console.log(response);
          self.username = req.username;
          joinRoom("PublicRoom", "secret");
          joinRoom("PrivateRoom", "secret");
          joinRoom("PasswordProtectedRoom", "secret");
          joinRoom("test", "secret");
          joinRoom("asdf", "secret");
          resolve(true);
        }
      });
    });
  };

  const createUser = async (req: AuthRequest): Promise<boolean> => {
    if (!req || !req.username || req.username === "")
      return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      socket.emit("userCreation", req, (response: DevError | string) => {
        if (typeof response === "object") {
          console.log("Error response from user creation: ", response.error);
          resolve(false);
          // Try to log in instead
        } else {
          self.username = req.username;
          setRooms(null);
          console.log(`Created user ${req.username} successfully!`);

          // FIXME: For testing purposes only
          // Join three separate rooms on connection
          joinRoom("PublicRoom", "secret");
          joinRoom("PrivateRoom", "secret");
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
  const { addSocketListener, removeSocketListener } = useWebSocketContext();

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
    addSocketListener("chatMemberUpdated", handleNewChatRoomMember);
  };

  // Use effect for setting up and cleaning up listeners
  useEffect(() => {
    setupSocketListeners();
    return () => {
      removeSocketListener("connect");
      removeSocketListener("newMessage");
      removeSocketListener("newChatRoomMember");
      removeSocketListener("chatRoomMemberLeft");
      removeSocketListener("chatRoomMemberKicked");
      removeSocketListener("addedToNewChatRoom");
      removeSocketListener("chatMemberUpdated");
    };
  }, []);

  /******************/
  /*   useEffects   */
  /******************/

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  useEffect(() => {
    if (socket && !self.username) {
      self.username = "schlurp";
    }
  }, [socket, ""]);

  // FIXME: temporary addition for dev build to test user creation
  // If no user is logged in, try to create a temporary user
  useEffect(() => {
    // Try to create a temporary user
    if (self.username) {
      setRooms(() => {
        return {};
      });

      const createTempUser = async (username: string): Promise<void> => {
        const req: AuthRequest = {
          username,
          firstName: "Schl",
          lastName: "urp",
          email: `${username}@schluuuuu.uuuuurp`,
          avatar: `https://i.pravatar.cc/150?img=${username}`
        };
        const userCreated = await createUser(req);
        if (!userCreated) {
          // Try to login instead
          const userLogged = await userLogin(req);
          if (!userLogged) {
            console.log("Failed to create or login to user", username);
          }
        }
      };

      createTempUser(self.username);
    }
  }, [self.username, ""]);

  return (
    <ChatContext.Provider
      value={{
        ...chatModel,
        joinRoom,
        sendRoomMessage,
        sendDirectMessage,
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
