// ChatModel.tsx
import { useState } from "react";
import { RoomType } from "./ChatViewModel";
import { MessageType } from "./components/Message";

export interface ChatModelType {
  tempUsername: string;
  setTempUsername: (username: string) => void;
  currentRoomName: string;
  setCurrentRoomName: (roomName: string) => void;
  rooms: { [key: string]: Array<MessageType> };
  setRooms: (
    callback: (prevRooms: { [key: string]: Array<MessageType> }) => {
      [key: string]: Array<MessageType>;
    }
  ) => void;
  currentRoomMessages: Array<MessageType>;
  setCurrentRoomMessages: (messages: Array<MessageType>) => void;
  contextMenuRoomsVisible: boolean;
  contextMenuUsersVisible: boolean;
  setContextMenuRoomsVisible: (arg: boolean) => void;
  setContextMenuUsersVisible: (arg: boolean) => void;
  contextMenuPosition: { x: number; y: number };
  contextMenuUsersPosition: { x: number; y: number };
  contextMenuData: RoomType | null;
  //FIXER CETTE MERDE
  contextMenuUsersData : string | null;

  handleContextMenu: (e: React.MouseEvent, roomData: { name: string }) => void;
  handleContextMenuUsers: (e: React.MouseEvent, roomData: { name: string }) => void;
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (visible: boolean) => void;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (visible: boolean) => void;
  unreadMessages: { [key: string]: number };
  setUnreadMessages: (unread: { [key: string]: number }) => void;
  truncateText: (text: string, maxLength: number) => string;
}

export const useChatModel = (): ChatModelType => {
  const [tempUsername, setTempUsername] = useState("");
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [rooms, setRooms] = useState({});
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const [contextMenuUsersData, setContextMenuUsersData] = useState(null);

  const [contextMenuRoomsVisible, setContextMenuRoomsVisible] = useState(false);
  const [contextMenuUsersVisible, setContextMenuUsersVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });
  const [contextMenuUsersPosition, setContextMenuUsersPosition] = useState({
    x: 0,
    y: 0
  });


  const handleContextMenu = (e, roomData) => {
    e.preventDefault();
    setContextMenuRoomsVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuData(roomData);
  };

  const handleContextMenuUsers = (e, roomData) => {
    e.preventDefault();
    setContextMenuUsersVisible(true);
    setContextMenuUsersPosition({ x: e.clientX, y: e.clientY });
    setContextMenuUsersData({name: "ohoh"});
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 1) + "…";
  };

  return {
    tempUsername,
    setTempUsername,
    currentRoomName,
    setCurrentRoomName,
    rooms,
    setRooms,
    currentRoomMessages,
    setCurrentRoomMessages,
    contextMenuData,
    contextMenuUsersData,
    contextMenuPosition,
    contextMenuUsersPosition,
    handleContextMenu,
    handleContextMenuUsers,
    contextMenuRoomsVisible,
    contextMenuUsersVisible,
    setContextMenuRoomsVisible,
    setContextMenuUsersVisible,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    truncateText
  };
};
