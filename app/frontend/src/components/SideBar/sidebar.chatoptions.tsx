import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { PageState } from "src/root.model";
import ButtonFunky from "../ButtonFunky";
import { useChatContext } from "../../chat/chat.context";

export default function SidebarChatOptions({ setPageState }) {
  const { setShowJoinRoomModal, setShowCreateRoomModal } = useChatContext();

  return (
    <List
      sx={{
        pt: 2,
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column"
      }}
      component="nav"
    >
      <ListItemButton onClick={() => setPageState(PageState.Chat)}>
        <ListItemIcon>
          <GroupAddIcon />
        </ListItemIcon>
        <ListItemText>Chat Page</ListItemText>
      </ListItemButton>

      <ButtonFunky
        content="Create a room"
        width={"80%"}
        onClick={() => setShowCreateRoomModal(true)}
      />
      <ButtonFunky
        content="Join a room"
        width={"80%"}
        onClick={() => setShowJoinRoomModal(true)}
      />
    </List>
  );
}
