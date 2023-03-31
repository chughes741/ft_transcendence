// ChatModel.tsx
import { useState } from "react";
import { RoomType } from "./ChatViewModel";
import { MessageType } from "./components/Message";

export interface ChatModelType {
  tempUsername: string;
  setTempUsername: (string) => void;
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
  contextMenuData: RoomType | null;
  handleContextMenu: (e: React.MouseEvent, roomData: { name: string }) => void;
  currentRoomMessages: Array<MessageType>;
  setCurrentRoomMessages: (messages: Array<MessageType>) => void;
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (visible: boolean) => void;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (visible: boolean) => void;
  unreadMessages: { [key: string]: number };
  setUnreadMessages: (unread: { [key: string]: number }) => void;
  truncateText: (text: string, maxLength: number) => string;
}

export const useChatModel = (): ChatModelType => {
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [rooms, setRooms] = useState({});
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [tempUsername, setTempUsername] = useState("");
  const [contextMenuData, setContextMenuData] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  const handleContextMenu = (e, roomData) => {
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

  // Other methods, like sendRoomMessage and joinRoom, will be moved to the ViewModel

  return {
    currentRoomName,
    setCurrentRoomName,
    rooms,
    setRooms,
    currentRoomMessages,
    setCurrentRoomMessages,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    unreadMessages,
    setUnreadMessages,
    tempUsername,
    setTempUsername,
    contextMenuData,
    contextMenuVisible,
    setContextMenuVisible,
    contextMenuPosition,
    handleContextMenu,
    truncateText
  };
};
