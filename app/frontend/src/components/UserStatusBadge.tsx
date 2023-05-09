import React from "react";
import { Badge, BadgeProps } from "@mui/material";
import { UserStatus } from "kingpong-lib";

interface UserStatusBadgeProps {
  status: UserStatus;
  anchorOrigin: BadgeProps["anchorOrigin"];
  children: React.ReactNode;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  anchorOrigin,
  children
}) => {
  return (
    <Badge
      color={
        status === UserStatus.ONLINE
          ? // status === "ONLINE"
            "success"
          : status === UserStatus.OFFLINE
          ? // : status === "OFFLINE"
            "error"
          : "warning"
      }
      anchorOrigin={anchorOrigin}
      overlap="circular"
      variant="dot"
    >
      {children}
    </Badge>
  );
};

export default UserStatusBadge;
