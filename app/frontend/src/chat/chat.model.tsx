// ChatModel.tsx
import { useState, MouseEvent } from "react";
import { RoomType, MessageType, UserListItem } from "./chat.types";

export interface ChatModelType {
  /* User */
  tempUsername: string;
  setTempUsername: (username: string) => void;

  /* Room List Information */
  currentRoomName: string;
  setCurrentRoomName: (roomName: string) => void;
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
  showDirectMessageModal: boolean;
  setShowDirectMessageModal: (visible: boolean) => void;
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (visible: boolean) => void;
  showJoinRoomModal: boolean;
  setShowJoinRoomModal: (visible: boolean) => void;
  showInviteUsersModal: boolean;
  setShowInviteUsersModal: (visible: boolean) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (visible: boolean) => void;
  passwordModalCallback: (password: string) => Promise<boolean>;
  setPasswordModalCallback: (
    callback: (password: string) => Promise<boolean>
  ) => void;

  /* Snackbars */
  showNewRoomSnackbar: boolean;
  setShowNewRoomSnackbar: (visible: boolean) => void;
}

export const useChatModel = (): ChatModelType => {
  /* User */
  const [tempUsername, setTempUsername] = useState("");

  /* Room List Information */
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);

  /* Modals */
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalCallback, setPasswordModalCallback] = useState<
    (password: string) => Promise<boolean>
  >(() => async () => false);

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

  return {
    tempUsername,
    setTempUsername,
    currentRoomName,
    setCurrentRoomName,
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
    showDirectMessageModal,
    setShowDirectMessageModal,
    showCreateRoomModal,
    setShowCreateRoomModal,
    showJoinRoomModal,
    setShowJoinRoomModal,
    showInviteUsersModal,
    setShowInviteUsersModal,
    showPasswordModal,
    setShowPasswordModal,
    passwordModalCallback,
    setPasswordModalCallback,
    showNewRoomSnackbar,
    setShowNewRoomSnackbar
  };
};
