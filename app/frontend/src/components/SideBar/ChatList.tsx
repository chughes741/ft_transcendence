import * as React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { ListItemButton } from "@mui/material";

export default function ChatList() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
  };

  return (
    <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      >
        <ListItemAvatar>
          <Avatar
            alt="Remy Sharp"
            src="/static/images/avatar/1.jpg"
          />
        </ListItemAvatar>
        <ListItemText
          primary="Brunch this weekend?"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                Ali Connors
              </Typography>
              {" — I'll be in your neighborhood doing errands this…"}
            </React.Fragment>
          }
        />
      </ListItemButton>
      <Divider
        variant="inset"
        component="li"
      />
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 1}
        onClick={(event) => handleListItemClick(event, 1)}
      >
        <ListItemAvatar>
          <Avatar
            alt="Travis Howard"
            src="/static/images/avatar/2.jpg"
          />
        </ListItemAvatar>
        <ListItemText
          primary="Summer BBQ"
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                to Scott, Alex, Jennifer
              </Typography>
              {" — Wish I could come, but I'm out of town this…"}
            </React.Fragment>
          }
        />
      </ListItemButton>
      <Divider
        variant="inset"
        component="li"
      />
      <ListItemButton
        alignItems="flex-start"
        selected={selectedIndex === 2}
        onClick={(event) => handleListItemClick(event, 2)}
      >
        <ListItemAvatar>
          <Avatar
            alt="Cindy Baker"
            src="/static/images/avatar/3.jpg"
          />
        </ListItemAvatar>
        <ListItemText
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
        />
      </ListItemButton>
    </List>
  );
}
