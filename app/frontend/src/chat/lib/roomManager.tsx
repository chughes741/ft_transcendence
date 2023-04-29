import { createContext, useContext, useState } from "react";
import { socket } from "../../contexts/WebSocket.context";
import {
  ChatMemberEntity,
  ChatRoomPayload,
  RoomType,
  MessageType,
  ChatRoomStatus,
  CreateRoomRequest,
  DevError,
  MessagePayload,
  UpdateChatRoomRequest
} from "../chat.types";
import { handleSocketErrorResponse } from "./helperFunctions";
import { useRootViewModelContext } from "../../root.context";

const RoomManagerContext = createContext(null);
export type RoomMap = { [key: string]: RoomType };

export interface RoomManagerContextType {
  rooms: RoomMap;
  setRooms: (callback: (prevRooms: RoomMap) => RoomMap) => void;
  handleJoinRoom: (roomName: string, password: string) => Promise<boolean>;
  handleSendRoomMessage: (
    roomName: string,
    message: string
  ) => Promise<boolean>;
  handleCreateNewRoom: (
    roomName: string,
    roomStatus: ChatRoomStatus,
    password: string
  ) => Promise<boolean>;
  handleChangeRoomStatus: (
    roomName: string,
    newStatus: ChatRoomStatus,
    oldPassword?: string,
    newPassword?: string
  ) => Promise<boolean>;
  handleFetchRoomMessagesPage: (
    roomName: string,
    date: Date,
    pageSize: number
  ) => Promise<MessageType[]>;
  updateRooms: (updateFn: (rooms: RoomMap) => void) => void;
  convertMessagePayloadToMessageType: (
    messagePayload: MessagePayload
  ) => MessageType;
  addMemberToRoom: (roomName: string, member: ChatMemberEntity) => void;
  addChatRoom: (chatRoomPayload: ChatRoomPayload) => Promise<RoomType>;
  addMessageToRoom: (roomName: string, message: MessageType) => void;
}

export const useRoomManager = (): RoomManagerContextType => {
  const context = useContext(RoomManagerContext);
  if (!context) {
    throw new Error("useRoomManager must be used within a RoomManagerProvider");
  }
  return context;
};

export const RoomManagerProvider = ({ children }) => {
  const { self } = useRootViewModelContext();

  const [rooms, setRooms] = useState({});

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
      isOwn: messagePayload.username === self.username,
      displayUser: true,
      displayTimestamp: true,
      displayDate: true,
      avatar:
        rooms[messagePayload.roomName]?.users[messagePayload.username]?.avatar
    };
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

  /**********************/
  /*   Room Functions   */
  /**********************/

  // Add member to room
  const addMemberToRoom = (roomName: string, member: ChatMemberEntity) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      if (!newRooms[roomName]) {
        console.warn("In addMemberToRoom, room not found: ", roomName);
        return newRooms;
      }
      newRooms[roomName].users[member.username] = member;
      return newRooms;
    });
  };

  const getRoomUserList = async (roomName: string) => {
    return new Promise<{ [key: string]: ChatMemberEntity }>((resolve) => {
      socket.emit(
        "listUsers",
        { chatRoomName: roomName },
        (users: ChatMemberEntity[]) => {
          const usersObj = users.reduce<{ [key: string]: ChatMemberEntity }>(
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

  const getTargetOfDirectMessage = (roomName: string) => {
    const roomNameSplit = roomName.split("$");
    const target =
      roomNameSplit[0] === self.username ? roomNameSplit[1] : roomNameSplit[0];
    return target;
  };

  // Adds a new room to the rooms state variable
  const addChatRoom = async (
    chatRoomPayload: ChatRoomPayload
  ): Promise<RoomType> => {
    // Validate the payload
    if (!chatRoomPayload.name) {
      console.warn("In addChatRoom, invalid payload: ", chatRoomPayload);
      return;
    }
    const userList = await getRoomUserList(chatRoomPayload.name);

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
        displayName:
          status === ChatRoomStatus.DIALOGUE
            ? getTargetOfDirectMessage(name)
            : name,
        status: status,
        rank: queryingUserRank,
        latestMessage: convertedLatestMessage,
        messages: [],
        lastActivity,
        hasUnreadMessages: false,
        unreadMessagesCount: 0,
        avatars,
        users: userList
      };
      updateRooms((newRooms) => {
        if (!newRooms[name]) {
          newRooms[name] = newRoom;
        }
        console.debug("Added room to rooms: ", newRooms);
        resolve(newRoom);
      });
    });
  };

  // FIXME: move to model?
  const addMessageToRoom = (roomName: string, message: MessageType) => {
    updateRooms((newRooms) => {
      if (!newRooms[roomName]) {
        console.warn("addMessageToRoom: Room does not exist");
      } else {
        newRooms[roomName].messages.push(message);
        newRooms[roomName].latestMessage = message;
        newRooms[roomName].lastActivity = new Date();
      }
    });
  };

  const addMessagesToRoom = (roomName: string, messages: MessageType[]) => {
    updateRooms((newRooms) => {
      if (!newRooms[roomName]) {
        console.warn("addMessagesToRoom: Room does not exist");
      } else {
        newRooms[roomName].messages.push(...messages);
        newRooms[roomName].latestMessage = messages[messages.length - 1];
        newRooms[roomName].lastActivity = newRooms[roomName].latestMessage
          ? newRooms[roomName].latestMessage
          : new Date();
      }
    });
  };

  // Create a new room
  const handleCreateNewRoom = async (
    roomName: string,
    roomStatus: ChatRoomStatus,
    roomPassword?: string
  ): Promise<boolean> => {
    const roomRequest: CreateRoomRequest = {
      name: roomName,
      status: roomStatus,
      password: roomPassword,
      owner: self.username
    };
    console.warn("ChatPage: Creating new room", { ...roomRequest });

    const response = await new Promise<DevError | ChatRoomPayload>((resolve) =>
      socket.emit("createRoom", roomRequest, resolve)
    );

    if (handleSocketErrorResponse(response)) {
      console.warn("Error response from join room: ", response.error);
      return false;
    }

    await addChatRoom(response as ChatRoomPayload);
    return true;
  };

  // Join a room
  const handleJoinRoom = async (
    roomName: string,
    password: string
  ): Promise<boolean> => {
    const joinRoomPayload = { roomName, password, user: self.username };
    const joinRoomRes = await new Promise<DevError | ChatRoomPayload>(
      (resolve) => {
        console.debug("Getting messages for room: ", roomName);
        socket.emit("joinRoom", joinRoomPayload, resolve);
      }
    );

    if (handleSocketErrorResponse(joinRoomRes)) {
      console.warn("Error response from join room: ", joinRoomRes.error);
      alert(joinRoomRes.error);
      return false;
    }

    await addChatRoom(joinRoomRes as ChatRoomPayload);

    const messageRequest = { roomName, date: new Date(), pageSize: 50 };
    const messagesRes = await new Promise<DevError | MessagePayload[]>(
      (resolve) => {
        socket.emit("getRoomMessagesPage", messageRequest, resolve);
      }
    );

    if (handleSocketErrorResponse(messagesRes)) {
      console.error(
        "Error response from get room messages: ",
        messagesRes.error
      );
      alert(messagesRes.error);
      return false;
    }

    const messages = (messagesRes as MessagePayload[]).map((message) =>
      convertMessagePayloadToMessageType(message)
    );
    addMessagesToRoom(roomName, messages);

    return true;
  };

  const handleFetchRoomMessagesPage = async (
    roomName: string,
    date: Date,
    pageSize: number
  ): Promise<MessageType[]> => {
    const messageRequest = { roomName, date, pageSize };
    const messagesRes = await new Promise<DevError | MessagePayload[]>(
      (resolve) => {
        socket.emit("getRoomMessagesPage", messageRequest, resolve);
      }
    );
    if (handleSocketErrorResponse(messagesRes)) {
      console.error(
        "Error response from get room messages: ",
        messagesRes.error
      );
    }

    const messages = (messagesRes as MessagePayload[]).map((message) =>
      convertMessagePayloadToMessageType(message)
    );
    addMessagesToRoom(roomName, messages);
    return messages;
  };

  const handleSendRoomMessage = async (
    roomName: string,
    message: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {

      console.log("Self sent", self, " And socket id : ", socket.id);

      socket.emit(
        "sendMessage",
        {
          sender: self.username,
          roomName: roomName,
          content: message
        },
        (res: DevError | string) => {
          if (typeof res === "object" && res.error) {
            console.warn("Error response from send message: ", res.error);
            resolve(false);
          }
        }
      );
      resolve(true);
    });
  };

  const handleChangeRoomStatus = async (
    roomName: string,
    newStatus: ChatRoomStatus,
    oldPassword?: string,
    newPassword?: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      console.warn(`Changing room status of ${roomName} to ${newStatus}`);

      const req: UpdateChatRoomRequest = {
        roomName,
        username: self.username,
        status: newStatus,
        oldPassword,
        newPassword
      };
      console.debug(`Request: `, req);
      socket.emit(
        "updateChatRoom",
        req,
        (response: DevError | ChatRoomPayload) => {
          if (handleSocketErrorResponse(response)) {
            console.warn("Error changing room status", response.error);
            resolve(false);
          } else {
            console.debug("Successfully changed room status!");
            updateRooms((newRooms) => {
              newRooms[roomName].status = newStatus;
            });
            resolve(true);
          }
        }
      );
    });
  };

  return (
    <RoomManagerContext.Provider
      value={{
        rooms,
        setRooms,
        addMemberToRoom,
        getChatRoomMembers: getRoomUserList,
        addChatRoom,
        addMessageToRoom,
        addMessagesToRoom,
        handleFetchRoomMessagesPage,
        updateRooms,
        convertMessagePayloadToMessageType,
        handleJoinRoom,
        handleSendRoomMessage,
        handleCreateNewRoom,
        handleChangeRoomStatus
      }}
    >
      {children}
    </RoomManagerContext.Provider>
  );
};
