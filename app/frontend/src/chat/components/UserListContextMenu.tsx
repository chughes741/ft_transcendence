import { useChatContext } from "../chat.context";
import ContextMenu from "../../components/ContextMenu";
import { PageState } from "src/root.model";
import { Paper } from "@mui/material";
import { useProfileViewModelContext } from "src/profile/profile.viewModel";
import { useRootViewModelContext } from "src/root.context";
import { ChatMemberRank, UserListItem } from "../chat.types";

interface UserContextMenuProps {
  ownRank: ChatMemberRank;
  contextMenuVisible: boolean;
  setContextMenuVisible: (visible: boolean) => void;
  position: { x: number; y: number };
  contextMenuData: UserListItem | null;
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
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
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

  const commonOptions = [
    {
      label: "View Profile",
      onClick: onViewProfile
    },
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

  let adminOptions = [];

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
        {
          label: "Mute User",
          submenu: durationOptions.map(({ label, value }) => ({
            label,
            onClick: () => onMuteUser(value)
          }))
        }
      ];
    }
  }

  let ownerOptions = [];

  if (ownRank === ChatMemberRank.OWNER) {
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

  const options = [...commonOptions, ...adminOptions, ...ownerOptions];

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
