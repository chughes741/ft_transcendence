import React from "react";
import {
  Badge,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  getRankIcon,
  getStatusIcon,
  renderAvatarGroup,
  truncateText
} from "../lib/helperFunctions";
import { RoomType } from "../chat.types";
import { useRootViewModelContext } from "../../root.context";

interface RoomListItemProps {
  room: RoomType;
  isSelected: boolean;
  onRoomSelect: (roomName: string) => void;
  onContextMenu: (e: React.MouseEvent<HTMLLIElement>, room: RoomType) => void;
}

const RoomListItem: React.FC<RoomListItemProps> = ({
  room,
  isSelected,
  onRoomSelect,
  onContextMenu
}) => {
  const { self } = useRootViewModelContext();
  return (
    <ListItem
      onClick={() => onRoomSelect(room.name)}
      onContextMenu={(e) => onContextMenu(e, room)}
    >
      <ListItemButton selected={isSelected}>
        <ListItemIcon>
          <Badge
            anchorOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            overlap="circular"
            color="error"
            badgeContent={
              room.hasUnreadMessages ? room.unreadMessagesCount : null
            }
          >
            {renderAvatarGroup(room, self.username)}
          </Badge>
        </ListItemIcon>
        <ListItemText
          style={{ overflowX: "hidden" }}
          primary={
            <>
              {getRankIcon(room.rank, {})}
              {room.name}
            </>
          }
          secondary={
            room.messages.length > 0
              ? truncateText(
                  room?.messages[room.messages.length - 1]?.content,
                  42
                )
              : ""
          }
        />
        <span style={{ marginLeft: "auto", marginRight: "16px" }}>
          {getStatusIcon(room.status)}
        </span>
      </ListItemButton>
    </ListItem>
  );
};

export default RoomListItem;
