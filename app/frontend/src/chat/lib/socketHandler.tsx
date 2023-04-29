import { PageState } from "src/root.model";
import {
  LeaveRoomRequest,
  MessagePayload,
  RoomMemberEntity
} from "../chat.types";
import { socket } from "src/contexts/WebSocket.context";
import { useRootViewModelContext } from "src/root.context";
import { createBrowserHistory } from "history";

// Define handlers
export const handleConnectCreator = () => () => {
  console.debug("Successfully connected to the server");
};
/*
export const handleUnauthorizedCreator = () => () => {
  console.log("UNAuthorized Socket connexion");
  const history = createBrowserHistory();
  const { setSessionToken, setPageState, setFullscreen, setSelf } = useRootViewModelContext();

  fetch(`/auth/deleteToken?socketId=${socket.id}`, {
    method: 'POST',
  });
  setSessionToken("");
  setPageState(PageState.Auth);
  history.push("/auth");
  setFullscreen(true);
  setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
}*/

export const handleNewMessageCreator =
  (
    addMessageToRoom,
    currentRoomName: string,
    convertMessagePayloadToMessageType
  ) =>
    (newMessage: MessagePayload): boolean => {
      console.debug("New Message:", newMessage);
      const messageData = convertMessagePayloadToMessageType(newMessage);
      addMessageToRoom(newMessage.roomName, messageData);
      return newMessage.roomName === currentRoomName;
    };

export const handleNewChatRoomMemberCreator =
  (updateRooms) => (member: RoomMemberEntity) => {
    console.debug("New room member: ", member);
    updateRooms((newRooms) => {
      if (!newRooms || !newRooms[member.roomName]) return;
      newRooms[member.roomName].users[member.user.username] = member.user;
    });
  };

export const handleChatRoomMemberLeftCreator =
  (updateRooms) =>
    ({ roomName, username }: LeaveRoomRequest) => {
      console.debug(`User ${username} left room ${roomName}`);
      updateRooms((newRooms) => {
        delete newRooms[roomName].users[username];
      });
    };

export const handleChatRoomMemberKickedCreator =
  (updateRooms) => (member: RoomMemberEntity) => {
    console.debug("Room member kicked: ", member.user);
    updateRooms((newRooms) => {
      delete newRooms[member.roomName].users[member.user.username];
    });
  };

export const handleAddedToNewChatRoomCreator =
  (addChatRoom, setShowNewRoomSnackbar) => (room) => {
    console.debug("You have been added to a new chat room", room);
    addChatRoom(room);
    setShowNewRoomSnackbar(true);
  };
