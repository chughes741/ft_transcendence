import React from "react";
import {
  Avatar,
  AvatarGroup,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { RoomType } from "../chat.viewModel";
import { FaCrown } from "react-icons/fa";
import { useChatContext } from "../chat.context";
import {
  getStatusIcon,
  renderAvatarGroup,
  truncateText
} from "./helperFunctions";

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
  const { tempUsername } = useChatContext();
  return (
    <ListItem
      onClick={() => onRoomSelect(room.name)}
      onContextMenu={(e) => onContextMenu(e, room)}
    >
      <ListItemButton selected={isSelected}>
        <span style={{ marginRight: "auto", marginLeft: "8px" }}>
          {room.status !== "DIALOGUE" && room.rank === "OWNER" && <FaCrown />}
        </span>
        <ListItemIcon>{renderAvatarGroup(room, tempUsername)}</ListItemIcon>
        <ListItemText
          style={{ overflowX: "hidden" }}
          primary={room.name}
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
