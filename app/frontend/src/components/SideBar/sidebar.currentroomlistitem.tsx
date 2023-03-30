import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import GroupIcon from "@mui/icons-material/Group";

class ChatRoomMember {
  name: string;
  avatar_src: string;
}

class ChatRoom {
  room_name: string;
  is_private: boolean;
  member_count: number;
  members: ChatRoomMember[];
}

class ChatRoomList {
  rooms: ChatRoom[];
}

export function CurrentRoomListItem() {
  return (
      <ListItem
      >
        <AvatarGroup max={3}>
          <Avatar
            alt="Travis Howard"
            src="/static/images/avatar/1.jpg"
          />
          <Avatar
            alt="Travis Howard"
            src="/static/images/avatar/2.jpg"
          />
          <Avatar
            alt="Cindy Baker"
            src="/static/images/avatar/3.jpg"
          />
          <Avatar
            alt="Agnes Walker"
            src="/static/images/avatar/4.jpg"
          />
          <Avatar
            alt="Trevor Henderson"
            src="/static/images/avatar/5.jpg"
          />
        </AvatarGroup>
      <ListItemText primary="this is room here" />
          {/* <ListItemIcon>
            {room.is_private === true ? <LockIcon /> : <ChatIcon />}
          </ListItemIcon> */}
          
          <Badge
            badgeContent={5}
            color="primary"
          >
            <GroupIcon color="action" />
          </Badge>
      </ListItem>
  );
}