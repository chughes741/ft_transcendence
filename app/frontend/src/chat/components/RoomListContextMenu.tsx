import React from "react";
import ContextMenu from "../../components/ContextMenu";
import { RoomType, ChatRoomStatus } from "../chat.types";

interface RoomContextMenuProps {
  contextMenuVisible: boolean;
  setContextMenuVisible: (visible: boolean) => void;
  position: { x: number; y: number };
  contextMenuData: RoomType | null;
  onLeaveRoom: () => void;
  onInvitePeopleToRoom: () => void;
  onChangeRoomStatus: (status: ChatRoomStatus) => Promise<boolean>;
}

const RoomContextMenu: React.FC<RoomContextMenuProps> = ({
  contextMenuVisible,
  setContextMenuVisible,
  position,
  contextMenuData,
  onLeaveRoom,
  onInvitePeopleToRoom,
  onChangeRoomStatus
}) => {
  if (!contextMenuData) return null;

  const generateSubmenuOptions = () => {
    const options = [];
    for (const status in ChatRoomStatus) {
      if (contextMenuData.status !== ChatRoomStatus[status]) {
        options.push({
          label: ChatRoomStatus[status],
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
