import { createContext, useEffect, useState } from "react";
import { MessageType } from "./Message";
import { socket } from "../../../contexts/WebSocketContext";
import { DevError, RoomType } from "../ChatPage";

type ChatContextType = {
  contextMenuVisible: boolean;
  setContextMenuVisible: (arg: boolean) => void;
  contextMenuPosition: { x: number; y: number };
  rooms: { [key: string]: Array<MessageType> };
  setRooms: (
    callback: (prevRooms: { [key: string]: Array<MessageType> }) => {
      [key: string]: Array<MessageType>;
    }
  ) => void;
  currentRoomName: string;
  setCurrentRoomName: (roomName: string) => void;
  handleContextMenu: (e: React.MouseEvent, roomData: { name: string }) => void;
  contextMenuData: RoomType;
  currentRoomMessages: Array<MessageType>;
  setCurrentRoomMessages: (messages: Array<MessageType>) => void;
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (visible: boolean) => void;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (visible: boolean) => void;
  unreadMessages: { [key: string]: number };
  setUnreadMessages: (unread: { [key: string]: number }) => void;
  sendRoomMessage: (roomName: string, message: string) => void;
  joinRoom: (roomName: string, password: string) => void;
  tempUsername: string;
  setTempUsername: (string) => void;
};

// To prevent empty-function errors
/* eslint-disable */
export const ChatContext = createContext<ChatContextType>({
  contextMenuVisible: false,
  setContextMenuVisible: (arg: false) => {},
  contextMenuPosition: { x: 0, y: 0 },
  rooms: {},
  setRooms: (callback) => {},
  currentRoomName: "",
  setCurrentRoomName: () => {},
  handleContextMenu: () => {},
  contextMenuData: { name: "" },
  currentRoomMessages: [],
  setCurrentRoomMessages: () => {},
  showCreateRoomModal: false,
  setShowCreateRoomModal: () => {},
  showJoinRoomModal: false,
  setShowJoinRoomModal: () => {},
  unreadMessages: {},
  setUnreadMessages: () => {},
  sendRoomMessage: () => {},
  joinRoom: () => {},
  tempUsername: "",
  setTempUsername: () => {}
});
/* eslint-enable */

export const ChatProvider = ({ children }) => {
  const [currentRoomName, setCurrentRoomName] = useState<string>("");
  const [rooms, setRooms] = useState<{ [key: string]: Array<MessageType> }>({});
  const [currentRoomMessages, setCurrentRoomMessages] = useState<
    Array<MessageType>
  >([]);
  const [showCreateRoomModal, setShowCreateRoomModal] =
    useState<boolean>(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});

  // FIXME: temporary addition for dev build to test user creation
  // TODO: remove this when user creation is implemented
  const [tempUsername, setTempUsername] = useState<string>("");

  /********************/
  /*   Context Menu   */
  /********************/
  const [contextMenuData, setContextMenuData] = useState<RoomType | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });
  const handleContextMenu = (e: React.MouseEvent, roomData: RoomType) => {
    e.preventDefault();

    setContextMenuVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuData(roomData);
  };

  /**
   *  Update displayed room messages on change of room selection
   */
  useEffect(() => {
    if (rooms[currentRoomName]) {
      setCurrentRoomMessages(rooms[currentRoomName]);
    } else {
      setCurrentRoomMessages([]);
    }
  }, [rooms, currentRoomName]);

  const joinRoom = async (
    roomName: string,
    password: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      console.log(
        "ChatPage: Creating new room",
        roomName,
        password,
        tempUsername
      );
      socket.emit(
        "joinRoom",
        { roomName, password, user: tempUsername },
        // Socket callback
        (res: DevError | string) => {
          if (typeof res === "object" && res.error) {
            resolve(false);
          }
        }
      );
      setRooms((prevRooms) => {
        const newRooms = { ...prevRooms };
        newRooms[roomName] = [];
        return newRooms;
      });
      setCurrentRoomName(roomName);
      resolve(true);
    });
  };

  const sendRoomMessage = (roomName: string, message: string) => {
    socket.emit("sendMessage", {
      sender: tempUsername,
      roomName: roomName,
      content: message
    });
  };

  return (
    <ChatContext.Provider
      value={{
        contextMenuVisible,
        setContextMenuVisible,
        contextMenuPosition,
        handleContextMenu,
        contextMenuData,
        rooms,
        setRooms,
        currentRoomName,
        setCurrentRoomName,
        currentRoomMessages,
        setCurrentRoomMessages,
        showCreateRoomModal,
        setShowCreateRoomModal,
        showJoinRoomModal,
        setShowJoinRoomModal,
        unreadMessages,
        setUnreadMessages,
        sendRoomMessage,
        joinRoom,
        tempUsername,
        setTempUsername
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
