import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { PageState } from "src/root.model";
import ButtonFunky from "../ButtonFunky";
import { useChatContext } from "../../chat/chat.context";
import { AddCircleOutline, Chat, MeetingRoom } from "@mui/icons-material";
import DynamicIconButton from "../DynamicIconButton";

export default function SidebarChatOptions({ setPageState }) {
  const {
    setShowJoinRoomModal,
    setShowCreateRoomModal,
    setShowDirectMessageModal
  } = useChatContext();

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

      <DynamicIconButton
        text="Message a friend"
        icon={<Chat style={{ fontSize: "2rem", color: "white" }} />}
        onClick={() => setShowDirectMessageModal(true)}
      />
      <DynamicIconButton
        text="Create a room"
        icon={<AddCircleOutline style={{ fontSize: "2rem", color: "white" }} />}
        onClick={() => setShowCreateRoomModal(true)}
      />
      <DynamicIconButton
        text="Join a room"
        icon={<MeetingRoom style={{ fontSize: "2rem", color: "white" }} />}
        onClick={() => setShowJoinRoomModal(true)}
      />

      {/* FIXME: If I remove this, the colors are fucked */}
      {false && (
        <>
          <ButtonFunky
            icon={<Chat />}
            content="Message a friend"
            width={"80%"}
            onClick={() => setShowDirectMessageModal(true)}
          />
          <ButtonFunky
            icon={<AddCircleOutline />}
            content="Create a room"
            width={"80%"}
            onClick={() => setShowCreateRoomModal(true)}
          />
          <ButtonFunky
            icon={<MeetingRoom />}
            content="Join a room"
            width={"80%"}
            onClick={() => setShowJoinRoomModal(true)}
          />
        </>
      )}
    </List>
  );
}
