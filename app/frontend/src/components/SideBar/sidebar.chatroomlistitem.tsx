import StarBorder from "@mui/icons-material/StarBorder";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LockIcon from "@mui/icons-material/Lock";
import Badge from "@mui/material/Badge";
import GroupIcon from "@mui/icons-material/Group";
import ChatIcon from "@mui/icons-material/Chat";
import ListItem from "@mui/material/ListItem";

class ChatRoomListItemDto {
  room_name: string;
  is_private: boolean;
  member_count: number;
}

/**
 * @param ChatRoomListItemDto
 */
export function ChatRoomListItem({ room }) {
  //Need to use lock icon if room is private

  return (
    //Needs to return a map of available channels
    <ListItem
	key={room}
	disablePadding>
      <ListItemButton sx={{ pl: 4 }}>
        <ListItemIcon>
          {room.is_private === true ? <LockIcon /> : <ChatIcon />}
        </ListItemIcon>
        <ListItemText primary={room.room_name} />
        <Badge
          badgeContent={room.member_count}
          color="primary"
        >
          <GroupIcon color="action" />
        </Badge>
      </ListItemButton>
    </ListItem>
  );
}
