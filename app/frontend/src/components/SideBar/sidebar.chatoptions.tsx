import List from "@mui/material/List";
import { useChatContext } from "../../chat/chat.context";
import { AddCircleOutline, Chat } from "@mui/icons-material";
import { IoEnterOutline } from "react-icons/io5";
import ButtonFunky from "../ButtonFunky";

export default function SidebarChatOptions() {
  const {
    setShowJoinRoomModal,
    setShowCreateRoomModal,
    setShowDirectMessageModal
  } = useChatContext();

  return (
    <List
      sx={{
        pt: 6,
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column"
      }}
      component="nav"
    >
      <ButtonFunky
        icon={<Chat />}
        content="Message a friend"
        width={"100%"}
        onClick={() => setShowDirectMessageModal(true)}
      />
      <ButtonFunky
        icon={<AddCircleOutline />}
        content="Create a room"
        width={"100%"}
        onClick={() => setShowCreateRoomModal(true)}
      />
      <ButtonFunky
        icon={<IoEnterOutline />}
        content="Join a room"
        width={"100%"}
        onClick={() => setShowJoinRoomModal(true)}
      />
    </List>
  );
}
