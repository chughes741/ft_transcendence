// ChatModel.tsx
import { useState, MouseEvent } from "react";
import { RoomType } from "./chat.viewModel";
import { MessageType } from "./components/Message";
import { UserListItem } from "./components/Userlist";

export interface ChatModelType {
  /* User */
  tempUsername: string;
  setTempUsername: (username: string) => void;

  /* Room List Information */
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

  /* Room Context Menu */
  contextMenuData: RoomType | null;
  contextMenuPosition: { x: number; y: number };
  contextMenuRoomsVisible: boolean;
  setContextMenuRoomsVisible: (arg: boolean) => void;
  handleContextMenu: (e: MouseEvent, roomData: { name: string }) => void;

  /* UserList Context Menu */
  contextMenuUsersData: UserListItem | null;
  contextMenuUsersPosition: { x: number; y: number };
  contextMenuUsersVisible: boolean;
  setContextMenuUsersVisible: (arg: boolean) => void;
  handleContextMenuUsers: (e: MouseEvent, userData: UserListItem) => void;

  /* Modals */
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (visible: boolean) => void;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (visible: boolean) => void;
  showInviteUsersModal: boolean;
  setShowInviteUsersModal: (visible: boolean) => void;

  /* Snackbars */
  showNewRoomSnackbar: boolean;
  setShowNewRoomSnackbar: (visible: boolean) => void;

  /* Helper Functions */
  truncateText: (text: string, maxLength: number) => string;
}

export const useChatModel = (): ChatModelType => {
  /* User */
  const [tempUsername, setTempUsername] = useState("");

  /* Room List Information */
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [rooms, setRooms] = useState({});
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);

  /* Modals */
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);

  /* Snackbars */
  const [showNewRoomSnackbar, setShowNewRoomSnackbar] = useState(false);

  /* Room Context Menu */
  const [contextMenuData, setContextMenuData] = useState(null);
  const [contextMenuRoomsVisible, setContextMenuRoomsVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  const handleContextMenu = (e: MouseEvent, roomData: RoomType) => {
    e.preventDefault();
    setContextMenuRoomsVisible(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuData(roomData);
  };

  /* UserList Context Menu */
  const [contextMenuUsersData, setContextMenuUsersData] = useState(null);
  const [contextMenuUsersVisible, setContextMenuUsersVisible] = useState(false);
  const [contextMenuUsersPosition, setContextMenuUsersPosition] = useState({
    x: 0,
    y: 0
  });

  const handleContextMenuUsers = (e: MouseEvent, userData: UserListItem) => {
    e.preventDefault();
    setContextMenuUsersVisible(true);
    setContextMenuUsersPosition({ x: e.clientX, y: e.clientY });
    setContextMenuUsersData(userData);
  };

  /* Helper Functions */
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
    showInviteUsersModal,
    setShowInviteUsersModal,
    showNewRoomSnackbar,
    setShowNewRoomSnackbar,
    truncateText
  };
};
