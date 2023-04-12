import React from "react";
import { ChatRoomStatus, RoomType } from "../chat.viewModel";
import ContextMenu from "../../components/ContextMenu";

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
        contextMenuData.status === "DIALOGUE"
          ? "Quit Conversation"
          : "Leave Room",
      onClick: onLeaveRoom
    },
    ...(contextMenuData && contextMenuData.status !== "DIALOGUE"
      ? [
          {
            label: "Invite Users to Room",
            onClick: onInvitePeopleToRoom
          }
        ]
      : []),
    ...(contextMenuData &&
    contextMenuData.status !== "DIALOGUE" &&
    contextMenuData.rank === "OWNER"
      ? [
          {
            label: "Change Room Status",
            submenu: [
              ...(contextMenuData && contextMenuData.status !== "PRIVATE"
                ? [
                    {
                      label: "Private",
                      onClick: () => {
                        onChangeRoomStatus("PRIVATE").then();
                      }
                    }
                  ]
                : []),
              ...(contextMenuData && contextMenuData.status !== "PUBLIC"
                ? [
                    {
                      label: "Public",
                      onClick: () => {
                        onChangeRoomStatus("PUBLIC").then();
                      }
                    }
                  ]
                : []),
              ...(contextMenuData && contextMenuData.status !== "PASSWORD"
                ? [
                    {
                      label: "Password Protected",
                      onClick: () => {
                        onChangeRoomStatus("PASSWORD").then();
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
