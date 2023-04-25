import ContextMenu from "../../components/ContextMenu";
import { useRootViewModelContext } from "src/root.context";
import {
  ChatMemberRank,
  ChatMemberEntity,
  ChatMemberStatus,
  ChatRoomStatus
} from "../chat.types";
import { useEffect, useState } from "react";
import { useProfileViewModelContext } from "../../profile/profile.viewModel";

interface UserContextMenuProps {
  ownRank: ChatMemberRank;
  contextMenuVisible: boolean;
  setContextMenuVisible: (visible: boolean) => void;
  position: { x: number; y: number };
  contextMenuData: ChatMemberEntity | null;
  onViewProfile: () => void;
  onInviteToGame: () => void;
  onSendDirectMessage: () => void;
  onAddFriend: () => void;
  onKickUser: () => void;
  onBlockUser: () => void;
  sendUpdateRequest: (
    duration: number,
    newStatus: ChatMemberStatus,
    newRank: ChatMemberRank
  ) => void;
  onPromoteToAdmin: () => void;
  onDemoteToUser: () => void;
  currentRoomStatus: ChatRoomStatus;
}

export interface CMenuOption {
  label: string;
  value: number;
}

const muteDurationOptions: Array<CMenuOption> = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "1 hour", value: 60 },
  { label: "12 hours", value: 720 },
  { label: "1 day", value: 1440 },
  { label: "3 days", value: 4320 },
  { label: "1 week", value: 10080 },
  { label: "Permanently", value: -1 }
];

const UserContextMenu: React.FC<UserContextMenuProps> = ({
  ownRank,
  contextMenuVisible,
  setContextMenuVisible,
  position,
  contextMenuData,
  onViewProfile,
  onInviteToGame,
  onSendDirectMessage,
  onBlockUser,
  sendUpdateRequest,
  onPromoteToAdmin,
  onDemoteToUser,
  currentRoomStatus
}) => {
  if (!contextMenuData) return null;
  const { self } = useRootViewModelContext();

  const { friends } = useProfileViewModelContext();

  const isFriend = friends?.some(
    (friend) => friend.username === contextMenuData.username
  );

  const commonOptions = [
    {
      label: "View Profile",
      onClick: onViewProfile
    }
  ];
  let othersOptions = [];
  if (contextMenuData.username !== self.username) {
    othersOptions = [
      {
        label: "Invite to game",
        onClick: onInviteToGame
      },
      {
        label: "Block User",
        onClick: onBlockUser
      },
      ...(currentRoomStatus !== ChatRoomStatus.DIALOGUE
        ? [
            {
              label: "Send direct message",
              onClick: onSendDirectMessage
            }
          ]
        : []),
      ...(!isFriend
        ? [
            {
              label: "Add friend",
              onClick: onSendDirectMessage
            }
          ]
        : [])
    ];
  }

  let adminOptions = [];

  const muteOption =
    contextMenuData.chatMemberStatus === ChatMemberStatus.MUTED
      ? {
          label: "Unmute user",
          onClick: () => {
            console.debug(`Unmuting user ${contextMenuData.username}...`);
            const status = ChatMemberStatus.OK;
            const duration = -1;
            console.debug("duration: " + duration + " status: " + status);
            sendUpdateRequest(duration, status, contextMenuData.rank);
          }
        }
      : {
          label: "Mute user",
          submenu: JSON.parse(JSON.stringify(muteDurationOptions)).map(
            (option) => ({
              label: option.label,
              onClick: () => {
                console.debug(`Muting user ${contextMenuData.username}...`);
                const status = ChatMemberStatus.MUTED;
                console.debug(
                  "duration: " + option.value + " status: " + status
                );
                sendUpdateRequest(option.value, status, contextMenuData.rank);
              }
            })
          )
        };

  const banOption =
    contextMenuData.chatMemberStatus === ChatMemberStatus.BANNED
      ? {
          label: "Unban user",
          onClick: () => {
            console.debug(`Unbanning user ${contextMenuData.username}...`);
            const status = ChatMemberStatus.OK;
            const duration = -1;
            console.debug("duration: " + duration + " status: " + status);
            sendUpdateRequest(duration, status, contextMenuData.rank);
          }
        }
      : contextMenuData.chatMemberStatus === ChatMemberStatus.MUTED
      ? {
          label: "Ban user for duration of mute",
          onClick: () => {
            console.debug(
              `Banning user ${contextMenuData.username} for the duration of mute...`
            );
            const status = ChatMemberStatus.BANNED;
            const duration = 0;
            sendUpdateRequest(duration, status, contextMenuData.rank);
          }
        }
      : null;

  if (ownRank === ChatMemberRank.OWNER || ownRank === ChatMemberRank.ADMIN) {
    if (contextMenuData.rank !== ChatMemberRank.OWNER) {
      adminOptions = [{ label: "---" }, muteOption, banOption];
    }
  }

  let ownerOptions = [];

  if (
    ownRank === ChatMemberRank.OWNER &&
    contextMenuData.rank !== ChatMemberRank.OWNER
  ) {
    ownerOptions = [
      { label: "---" },
      contextMenuData.rank === ChatMemberRank.ADMIN
        ? {
            label: "Demote to User",
            onClick: onDemoteToUser
          }
        : {
            label: "Promote to Admin",
            onClick: onPromoteToAdmin
          }
    ];
  }

  // In the UserContextMenu component, add the following lines:
  const [menuOptions, setMenuOptions] = useState<CMenuOption[]>([]);

  useEffect(() => {
    const updatedOptions = [
      ...commonOptions,
      ...othersOptions,
      ...adminOptions,
      ...ownerOptions
    ];
    setMenuOptions(updatedOptions);
  }, [
    contextMenuData,
    commonOptions,
    othersOptions,
    adminOptions,
    ownerOptions
  ]);

  useEffect(() => {
    if (contextMenuVisible) {
      console.debug(`UserContextMenu: ${contextMenuData.username}`);
    }
  }, [contextMenuVisible]);

  return (
    <ContextMenu
      contextMenuVisible={contextMenuVisible}
      setContextMenuVisible={setContextMenuVisible}
      position={position}
      options={menuOptions}
    />
  );
};

export default UserContextMenu;
