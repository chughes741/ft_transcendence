import {
  LeaveRoomRequest,
  MessagePayload,
  RoomMemberEntity
} from "../chat.types";
import { convertMessagePayloadToMessageType } from "./roomManager";

// Define handlers
export const handleConnectCreator = () => () => {
  console.log("Successfully connected to the server");
};

export const handleNewMessageCreator =
  (addMessageToRoom: Function, currentRoomName: string) =>
  (newMessage: MessagePayload): boolean => {
    console.log("Ding ding, you've got mail:", newMessage);
    const messageData = convertMessagePayloadToMessageType(newMessage);
    addMessageToRoom(newMessage.roomName, messageData);
    return newMessage.roomName === currentRoomName;
  };

export const handleNewChatRoomMemberCreator =
  (updateRooms: Function) => (member: RoomMemberEntity) => {
    console.log("New room member: ", member.user);
    updateRooms((newRooms) => {
      if (!newRooms || !newRooms[member.roomName]) return newRooms;
      newRooms[member.roomName] = newRooms[member.roomName];
      newRooms[member.roomName].users[member.user.username] = member.user;
    });
  };

export const handleChatRoomMemberLeftCreator =
  (updateRooms: Function) =>
  ({ roomName, username }: LeaveRoomRequest) => {
    console.log(`User ${username} left room ${roomName}`);
    updateRooms((newRooms) => {
      delete newRooms[roomName].users[username];
    });
  };

export const handleChatRoomMemberKickedCreator =
  (updateRooms: Function) => (member: RoomMemberEntity) => {
    console.log("Room member kicked: ", member.user);
    updateRooms((newRooms) => {
      delete newRooms[member.roomName].users[member.user.username];
    });
  };

export const handleAddedToNewChatRoomCreator =
  (addChatRoom: Function, setShowNewRoomSnackbar: Function) => (room) => {
    console.log(
      "You have been added to a new chat room, adding it to the list"
    );
    console.log(room);
    addChatRoom(room);
    setShowNewRoomSnackbar(true);
  };
