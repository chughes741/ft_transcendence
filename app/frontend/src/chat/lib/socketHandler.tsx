import {
  LeaveRoomRequest,
  MessagePayload,
  RoomMemberEntity
} from "../chat.types";

// Define handlers
export const handleConnectCreator = () => () => {
  console.log("Successfully connected to the server");
};

export const handleNewMessageCreator =
  (
    addMessageToRoom,
    currentRoomName: string,
    convertMessagePayloadToMessageType
  ) =>
  (newMessage: MessagePayload): boolean => {
    console.log("Ding ding, you've got mail:", newMessage);
    const messageData = convertMessagePayloadToMessageType(newMessage);
    addMessageToRoom(newMessage.roomName, messageData);
    return newMessage.roomName === currentRoomName;
  };

export const handleNewChatRoomMemberCreator =
  (updateRooms) => (member: RoomMemberEntity) => {
    console.log("New room member: ", member);
    console.log(member.user);
    updateRooms((newRooms) => {
      if (!newRooms || !newRooms[member.roomName]) return;
      newRooms[member.roomName].users[member.user.username] = member.user;
    });
  };

export const handleChatRoomMemberLeftCreator =
  (updateRooms) =>
  ({ roomName, username }: LeaveRoomRequest) => {
    console.log(`User ${username} left room ${roomName}`);
    updateRooms((newRooms) => {
      delete newRooms[roomName].users[username];
    });
  };

export const handleChatRoomMemberKickedCreator =
  (updateRooms) => (member: RoomMemberEntity) => {
    console.log("Room member kicked: ", member.user);
    updateRooms((newRooms) => {
      delete newRooms[member.roomName].users[member.user.username];
    });
  };

export const handleAddedToNewChatRoomCreator =
  (addChatRoom, setShowNewRoomSnackbar) => (room) => {
    console.log(
      "You have been added to a new chat room, adding it to the list"
    );
    console.log(room);
    addChatRoom(room);
    setShowNewRoomSnackbar(true);
  };
