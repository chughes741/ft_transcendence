import { useChatContext } from "../chat.context";
import ContextMenu from "../../components/ContextMenu";
import { PageState } from "src/root.model";
import { Paper } from "@mui/material";
import { useProfileViewModelContext } from "src/profile/profile.viewModel";
import { useRootViewModelContext } from "src/root.context";
import {
  ChatMemberRank,
  ChatMemberEntity,
  ChatMemberStatus,
  UNBAN_USER
} from "../chat.types";

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
  onKickUser: (duration: number) => void;
  onBanUser: (duration: number) => void;
  onMuteUser: (duration: number) => void;
  onPromoteToAdmin: () => void;
  onDemoteToUser: () => void;
}

const durationOptions = [
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
  onAddFriend,
  onKickUser,
  onBanUser,
  onMuteUser,
  onPromoteToAdmin,
  onDemoteToUser
}) => {
  if (!contextMenuData) return null;
  const { self } = useRootViewModelContext();

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
        label: "Invite to Game",
        onClick: onInviteToGame
      },
      {
        label: "Send Direct Message",
        onClick: onSendDirectMessage
      },
      {
        label: "Add friend",
        onClick: onAddFriend
      }
    ];
  }

  let adminOptions = [];

  // Define a mute option. If the user is already Muted, change it to Unban, with duration of -1
  let muteOption;
  if (contextMenuData.chatMemberStatus === ChatMemberStatus.MUTED) {
    muteOption = {
      label: "Unmute User",
      onClick: () => onMuteUser(UNBAN_USER)
    };
  } else {
    muteOption = {
      label: "Mute User",
      submenu: durationOptions.map(({ label, value }) => ({
        label,
        onClick: () => onMuteUser(value)
      }))
    };
  }

  if (ownRank === ChatMemberRank.OWNER || ownRank === ChatMemberRank.ADMIN) {
    if (contextMenuData.rank !== ChatMemberRank.OWNER) {
      adminOptions = [
        { label: "---" },
        {
          label: "Kick User",
          submenu: durationOptions.map(({ label, value }) => ({
            label,
            onClick: () => onKickUser(value)
          }))
        },
        {
          label: "Ban User",
          submenu: durationOptions.map(({ label, value }) => ({
            label,
            onClick: () => onBanUser(value)
          }))
        },
        muteOption
      ];
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

  const options = [
    ...commonOptions,
    ...othersOptions,
    ...adminOptions,
    ...ownerOptions
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

export default UserContextMenu;
