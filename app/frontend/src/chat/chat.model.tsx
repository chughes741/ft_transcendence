// ChatModel.tsx
import { useState, MouseEvent } from "react";
import {
  RoomType,
  MessageType,
  ChatMemberEntity,
  ChatRoomStatus
} from "./chat.types";

export interface ChatModelType {
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
  contextMenuRoomsNewStatus: ChatRoomStatus;
  setContextMenuRoomsNewStatus: (arg: ChatRoomStatus) => void;
  handleContextMenu: (e: MouseEvent, roomData: { name: string }) => void;

  /* UserList Context Menu */
  contextMenuUsersData: ChatMemberEntity | null;
  setContextMenuUsersData: (userData: ChatMemberEntity) => void;
  contextMenuUsersPosition: { x: number; y: number };
  setContextMenuUsersPosition: (position: { x: number; y: number }) => void;
  contextMenuUsersVisible: boolean;
  setContextMenuUsersVisible: (arg: boolean) => void;
  handleContextMenuUsers: (e: MouseEvent, userData: ChatMemberEntity) => void;

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

  /* Snackbars */
  showNewRoomSnackbar: boolean;
  setShowNewRoomSnackbar: (visible: boolean) => void;
}

export const useChatModel = (): ChatModelType => {
  /* Room List Information */
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentRoomMessages, setCurrentRoomMessages] = useState([]);

  /* Modals */
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  /* Snackbars */
  const [showNewRoomSnackbar, setShowNewRoomSnackbar] = useState(false);

  /* Room Context Menu */
  const [contextMenuData, setContextMenuData] = useState(null);
  const [contextMenuRoomsVisible, setContextMenuRoomsVisible] = useState(false);
  const [contextMenuRoomsNewStatus, setContextMenuRoomsNewStatus] = useState(
    ChatRoomStatus.PUBLIC
  );
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

  const handleContextMenuUsers = (
    e: React.MouseEvent,
    userData: ChatMemberEntity
  ) => {
    e.preventDefault();
    console.debug(
      `handleContextMenuUsers: ${userData.username}, event: ${e.button}`
    );
    setContextMenuUsersVisible(true);
    setContextMenuUsersPosition({ x: e.clientX, y: e.clientY });
    setContextMenuUsersData(userData);
  };

  return {
    currentRoomName,
    setCurrentRoomName,
    currentRoomMessages,
    setCurrentRoomMessages,
    contextMenuData,
    contextMenuPosition,
    contextMenuUsersData,
    setContextMenuUsersData,
    contextMenuRoomsNewStatus,
    setContextMenuRoomsNewStatus,
    contextMenuUsersPosition,
    setContextMenuUsersPosition,
    contextMenuUsersVisible,
    setContextMenuUsersVisible,
    handleContextMenuUsers,
    handleContextMenu,
    contextMenuRoomsVisible,
    setContextMenuRoomsVisible,
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
    showNewRoomSnackbar,
    setShowNewRoomSnackbar
  };
};
