import React from "react";
import { Avatar, AvatarGroup } from "@mui/material";
import {
  VpnKey,
  Public,
  VisibilityOff,
  Shield,
  Star
} from "@mui/icons-material";
import {
  ChatMemberRank,
  ChatRoomStatus,
  DevError,
  RoomType
} from "../chat.types";

// Helper function to handle errors
export const handleSocketErrorResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: DevError | any
): res is DevError => {
  return (res as DevError).error !== undefined;
};

export const getRankIcon = (
  rank: ChatMemberRank,
  style: React.CSSProperties
) => {
  switch (rank) {
    case ChatMemberRank.ADMIN:
      return (
        <Shield
          style={{
            fontSize: "1.1rem",
            borderRadius: "50%",
            ...style
          }}
        />
      );
    case ChatMemberRank.OWNER:
      return (
        <Star
          style={{
            fontSize: "1.1rem",
            borderRadius: "50%",
            ...style
          }}
        />
      );
    default:
      return <> </>;
  }
};

export const getStatusIcon = (status: ChatRoomStatus) => {
  switch (status) {
    case ChatRoomStatus.PASSWORD:
      return <VpnKey />;
    case ChatRoomStatus.PUBLIC:
      return <Public />;
    case ChatRoomStatus.PRIVATE:
      return <VisibilityOff />;
    case ChatRoomStatus.DIALOGUE:
      return <></>;
    default:
      return null;
  }
};

export const renderAvatarGroup = (room: RoomType, tempUsername: string) => {
  if (room.status === ChatRoomStatus.DIALOGUE) {
    const otherUser = Object.values(room.users)?.find(
      (user) => user.username !== tempUsername
    );
    return (
      <Avatar
        src={otherUser.avatar}
        alt={`Profile ${otherUser.username}`}
      />
    );
  } else {
    return (
      <AvatarGroup
        max={1}
        spacing="small"
      >
        {room.users &&
          Object.keys(room.users).length > 0 &&
          Object.values(room.users).map((user) => (
            <Avatar
              key={user.username}
              src={user.avatar}
              alt={`Profile ${user.username}`}
            />
          ))}
      </AvatarGroup>
    );
  }
};

/* Helper Functions */
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 1) + "…";
};
