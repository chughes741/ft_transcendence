import * as React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { AvatarGroup, Badge, ListItemButton, ListSubheader } from "@mui/material";
import { CurrentRoomListItem } from "./sidebar.currentroomlistitem";
import MailIcon from "@mui/icons-material/Mail";
import BadgeVisibility from "./sidebar.notificationbadge";
import NotificationBadge from "./sidebar.notificationbadge";
export default function ChatList() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
  };

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="nested-list-subheader"
        >
          Your Current Rooms
        </ListSubheader>
      }
    >
      {/* First element */}
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      >
        {/* Display room name and last line of text */}
        <ListItemText
          primary="Fun Party Time Spot"
          secondary="the best room"
        />
        {/* Get notification badge for end of item */}
        <NotificationBadge />
      </ListItemButton>
      <Divider
        variant="inset"
        component="li"
      />

      {/* Second element */}
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1)}
      >
        <ListItemText
          primary="JR's Backalley Bodega"
          secondary="only english people allowed"
        />
        <NotificationBadge />
      </ListItemButton>
      <Divider
        variant="inset"
        component="li"
      />
      {/* Third element */}
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 2}
        onClick={(event) => handleListItemClick(event, 2)}
      >
        <ListItemText
          primary="Cole's crusty condo"
          secondary="not actually that close to school"
        />
        <NotificationBadge />
      </ListItemButton>
    </List>
  );
}

{
  /* <ListItemText
primary="Oui Oui"
secondary={
  <React.Fragment>
    <Typography
      sx={{ display: "inline" }}
      component="span"
      variant="body2"
      color="text.primary"
    >
      Sandra Adams
    </Typography>
    {" — Do you have Paris recommendations? Have you ever…"}
  </React.Fragment>
}
/> */
}
