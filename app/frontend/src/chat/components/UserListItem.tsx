import React from "react";
import {
  Avatar,
  ListItemText,
  Badge,
  ListItemIcon,
  ListItemButton
} from "@mui/material";
import UserStatusBadge from "../../components/UserStatusBadge";
import {
  ChatMemberEntity,
  ChatMemberRank,
  ChatMemberStatus
} from "../chat.types";
import { useChatContext } from "../chat.context";
import { Cancel, Shield, Star, VolumeOff } from "@mui/icons-material";
import { Box } from "@mui/system";
import { getRankIcon } from "../lib/helperFunctions";

interface UserListItemProps {
  user: ChatMemberEntity;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  console.warn("UserListItem.tsx: ", user);

  const ownerBadge = (
    <Star
      style={{
        fontSize: "1.1rem",
        position: "absolute",
        top: -30,
        left: -30,
        zIndex: 1,
        backgroundColor: "#333", // Change the background color
        borderRadius: "50%"
      }}
    />
  );
  const adminBadge = (
    <Shield
      style={{
        fontSize: "1.1rem",
        position: "absolute",
        top: -30,
        left: -30,
        zIndex: 1,
        backgroundColor: "#333", // Change the background color
        borderRadius: "50%"
      }}
    />
  );

  const { handleContextMenuUsers: handleClick } = useChatContext();

  return (
    <ListItemButton
      onContextMenu={(e) => handleClick(e, user)}
      key={user.username}
      onClick={(e) => {
        handleClick(e, user);
      }}
    >
      <ListItemIcon>
        <Badge
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          style={{ position: "absolute", top: -30, left: -30, zIndex: 1 }}
          overlap="circular"
          badgeContent={getRankIcon(user.rank, {
            position: "absolute",
            top: -30,
            left: -30,
            zIndex: 1,
            backgroundColor: "#333",
            borderRadius: "50%"
          })}
        >
          <UserStatusBadge
            status={user.userStatus}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right"
            }}
          >
            <Avatar
              alt={user.username}
              src={user.avatar}
            />
          </UserStatusBadge>
        </Badge>
      </ListItemIcon>
      <ListItemText
        primary={
          <Box
            display="flex"
            alignItems="center"
          >
            {user.username}
            {user.chatMemberStatus === ChatMemberStatus.MUTED && (
              <VolumeOff
                fontSize="small"
                style={{ marginLeft: 8 }}
              />
            )}
            {user.chatMemberStatus === ChatMemberStatus.BANNED && (
              <Cancel
                fontSize="small"
                style={{ marginLeft: 24 }}
              />
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
};

export default UserListItem;
