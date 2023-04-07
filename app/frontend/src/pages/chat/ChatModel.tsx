// ChatModel.tsx
import { useState } from "react";
import { RoomType } from "./ChatViewModel";
import { MessageType } from "./components/Message";

export interface ChatModelType {
  tempUsername: string;
  setTempUsername: (username: string) => void;
  currentRoomName: string;
  setCurrentRoomName: (roomName: string) => void;
  rooms: { [key: string]: RoomType };
  setRooms: (
    callback: (prevRooms: { [key: string]: RoomType }) => {
      [key: string]: RoomType;
    }
  ) => void;
  currentRoomMessages: Array<MessageType>;
  setCurrentRoomMessages: (messages: Array<MessageType>) => void;
  contextMenuVisible: boolean;
  setContextMenuVisible: (arg: boolean) => void;
  contextMenuPosition: { x: number; y: number };
  contextMenuData: RoomType | null;
  handleContextMenu: (e: React.MouseEvent, roomData: { name: string }) => void;
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
  const [rooms, setRooms] = useState<{ [key: string]: RoomType }>({});
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [contextMenuData, setContextMenuData] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  const handleContextMenu = (e, roomData: RoomType) => {
    e.preventDefault();
    setContextMenuVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuData(roomData);
  };

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
    contextMenuPosition,
    handleContextMenu,
    contextMenuVisible,
    setContextMenuVisible,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    truncateText
  };
};
