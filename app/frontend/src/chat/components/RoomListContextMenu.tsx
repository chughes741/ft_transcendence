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

  const options = [
    {
      label:
        contextMenuData.status === ChatRoomStatus.DIALOGUE
          ? "Quit Conversation"
          : "Leave Room",
      onClick: onLeaveRoom
    },
    ...(contextMenuData && contextMenuData.status !== ChatRoomStatus.DIALOGUE
      ? [
          {
            label: "Invite Users to Room",
            onClick: onInvitePeopleToRoom
          }
        ]
      : []),
    ...(contextMenuData &&
    contextMenuData.status !== ChatRoomStatus.DIALOGUE &&
    contextMenuData.rank === "OWNER"
      ? [
          {
            label: "Change Room Status",
            submenu: [
              ...(contextMenuData &&
              contextMenuData.status !== ChatRoomStatus.PRIVATE
                ? [
                    {
                      label: "Private",
                      onClick: () => {
                        onChangeRoomStatus(ChatRoomStatus.PRIVATE).then();
                      }
                    }
                  ]
                : []),
              ...(contextMenuData &&
              contextMenuData.status !== ChatRoomStatus.PUBLIC
                ? [
                    {
                      label: "Public",
                      onClick: () => {
                        onChangeRoomStatus(ChatRoomStatus.PUBLIC).then();
                      }
                    }
                  ]
                : []),
              ...(contextMenuData &&
              contextMenuData.status !== ChatRoomStatus.PASSWORD
                ? [
                    {
                      label: "Password Protected",
                      onClick: () => {
                        onChangeRoomStatus(ChatRoomStatus.PASSWORD).then();
                      }
                    }
                  ]
                : [])
            ]
          }
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
