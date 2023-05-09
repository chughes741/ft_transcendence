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
  sendDirectMessage: (username: string) => Promise<boolean | string>;
  sendRoomMessage: (roomName: string, message: string) => Promise<boolean>;
  createNewRoom: (
    roomName: string,
    roomStatus: ChatRoomStatus,
    password: string
  ) => Promise<boolean>;
  leaveRoom: () => void;
  chatGatewayLogin: (req: AuthRequest) => Promise<boolean>;
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
    setShowPasswordModal
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
    handleChangeRoomStatus,
    handleFetchRoomMessagesPage
  } = useRoomManager();

  /**********************/
  /*   Util Functions   */
  /**********************/

  const selectRoom = (roomName: string) => {
    if (currentRoomName === roomName && pageState === PageState.Chat) {
      console.debug("selectRoom: Room is already selected. Toggling to Home.");
      setCurrentRoomName("");
      setPageState(PageState.Home);
      return;
    }
    if (!rooms[roomName]) {
      return;
    }
    console.debug(`selectRoom: Room ${roomName} selected! `, rooms[roomName]);
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
      chatModel.setContextMenuRoomsNewStatus(newStatus);
      setShowPasswordModal(true);
    } else {
      if ((await handleChangeRoomStatus(roomName, newStatus)) === false)
        return false;
    }
    return true;
  };

  const leaveRoom = async (): Promise<boolean> => {
    const roomName = contextMenuData.name;

    console.debug("Leaving room: ", roomName);

    return new Promise<boolean>((resolve) => {
      setContextMenuRoomsVisible(false);
      if (roomName === "" || roomName === undefined) return false;
      if (contextMenuData.status !== ChatRoomStatus.DIALOGUE) {
        const req: LeaveRoomRequest = {
          roomName: roomName,
          username: self.username
        };
        console.debug("Leaving room: ", req);
        socket.emit("leaveRoom", req, (response: DevError | string) => {
          if (handleSocketErrorResponse(response)) {
            console.warn("Error response from leave room: ", response.error);
            resolve(false);
          }
        });
      }
      currentRoomName === roomName && setCurrentRoomName("");
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        delete newRooms[roomName];
        return newRooms;
      });
      resolve(true);
    });
  };

  const sendDirectMessage = async (
    username: string
  ): Promise<boolean | string> => {
    return new Promise<boolean | string>((resolve) => {
      const req: SendDirectMessageRequest = {
        sender: self.username,
        recipient: username,
        senderRank: ChatMemberRank.USER
      };
      console.debug("Sending direct message: ", req);

      socket.emit(
        "sendDirectMessage",
        req,
        (response: ChatRoomPayload | DevError) => {
          if (handleSocketErrorResponse(response)) {
            console.warn(
              "Error response from send direct message: ",
              response.error
            );
            resolve(false);
          } else {
            console.debug(
              "Success response from send direct message: ",
              response
            );
            addChatRoom(response);
            setCurrentRoomName(response.name);
            setCurrentRoomMessages(rooms[response.name].messages);
            resolve(response.name);
          }
        }
      );
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

  /**********************/
  /*   User Functions   */
  /**********************/

  const chatGatewayLogin = async (req: AuthRequest): Promise<boolean> => {
    if (!req || !req.username || req.username === "")
      return Promise.resolve(false);

    setupSocketListeners();
    return new Promise<boolean>((resolve) => {
      socket.emit("chatGatewayLogin", req, (response: DevError | string) => {
        if (typeof response === "object") {
          console.warn(
            "Error response from chat gateway login: ",
            response.error
          );
          resolve(false);
        } else {
          self.username = req.username;
          resolve(true);
        }
      });
      socket.emit(
        "getRoomsOf",
        req.username,
        async (response: ChatRoomPayload[] | DevError) => {
          if (handleSocketErrorResponse(response)) {
            console.warn("Error response from get rooms: ", response.error);
            resolve(false);
          } else {
            console.debug("Success response from get rooms: ", response);
            for (const room of response) {
              await addChatRoom(room);
              handleFetchRoomMessagesPage(room.name, new Date(), 50);
            }
            resolve(true);
          }
        }
      );
    });
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
      removeSocketListener("unauthorized");
    };
  }, []);

  /******************/
  /*   useEffects   */
  /******************/

  // Update own avatar of all rooms when avatar changes
  useEffect(() => {
    if (self?.avatar && self?.username) {
      for (const roomName in rooms) {
        if (rooms[roomName].users[self.username]) {
          rooms[roomName].users[self.username].avatar = self.avatar;
        }
      }
    }
  }, [self.avatar, ""]);

  return (
    <ChatContext.Provider
      value={{
        ...chatModel,
        joinRoom,
        sendRoomMessage,
        sendDirectMessage,
        chatGatewayLogin,
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
