import React from "react";
import { Avatar, AvatarGroup } from "@mui/material";
import { VpnKey, Public, VisibilityOff } from "@mui/icons-material";
import { ChatRoomStatus, RoomType } from "../chat.types";

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
