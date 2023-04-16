import React from "react";
import ContextMenu from "../../components/ContextMenu";
import { RoomType, ChatRoomStatus } from "../chat.types";
import { useChatContext } from "../chat.context";

interface RoomContextMenuProps {
  contextMenuVisible: boolean;
  setContextMenuVisible: (visible: boolean) => void;
  position: { x: number; y: number };
  contextMenuData: RoomType | null;
  onLeaveRoom: () => void;
  onInvitePeopleToRoom: () => void;
  onChangeRoomStatus: (status: ChatRoomStatus) => Promise<boolean>;
  onChangeRoomPassword: () => void;
}

const RoomContextMenu: React.FC<RoomContextMenuProps> = ({
  contextMenuVisible,
  setContextMenuVisible,
  position,
  contextMenuData,
  onLeaveRoom,
  onInvitePeopleToRoom,
  onChangeRoomStatus,
  onChangeRoomPassword
}) => {
  if (!contextMenuData) return null;

  const humanFriendlyStatus = (status: ChatRoomStatus) => {
    switch (status) {
      case ChatRoomStatus.PASSWORD:
        return "Password";
      case ChatRoomStatus.PUBLIC:
        return "Public";
      case ChatRoomStatus.PRIVATE:
        return "Private";
      default:
        return status;
    }
  };

  const generateSubmenuOptions = () => {
    const options = [];
    for (const status in ChatRoomStatus) {
      if (
        contextMenuData.status !== ChatRoomStatus[status] &&
        ChatRoomStatus[status] !== ChatRoomStatus.DIALOGUE
      ) {
        options.push({
          label: humanFriendlyStatus(ChatRoomStatus[status]),
          onClick: () => onChangeRoomStatus(ChatRoomStatus[status]).then()
        });
      }
    }
    return options;
  };

  const options = [
    {
      label:
        contextMenuData.status === ChatRoomStatus.DIALOGUE
          ? "Quit Conversation"
          : "Leave Room",
      onClick: onLeaveRoom
    },
    ...(contextMenuData.status !== ChatRoomStatus.DIALOGUE
      ? [
          {
            label: "Invite Users to Room",
            onClick: onInvitePeopleToRoom
          },
          ...(contextMenuData.rank === "OWNER"
            ? [
                {
                  label: "Change Room Status",
                  submenu: generateSubmenuOptions()
                }
              ]
            : []),
          ...(contextMenuData.status === ChatRoomStatus.PASSWORD
            ? [
                {
                  label: "Change Room Password",
                  onClick: onChangeRoomPassword
                }
              ]
            : [])
        ]
      : [])
  ];

  return (
    <ContextMenu
      contextMenuVisible={contextMenuVisible}
      setContextMenuVisible={setContextMenuVisible}
      position={position}
      options={options}
    />
  );
};

export default RoomContextMenu;
