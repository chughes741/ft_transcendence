import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { ChatRoomListItem } from "./sidebar.chatroomlistitem";
import { PageState } from "src/views/root.model";
import ButtonFunky from "../ButtonFunky";
import { useChatViewModelContext } from "../../pages/chat/contexts/ChatViewModelContext";

class ChatRoomListItemDto {
  room_name: string;
  is_private: boolean;
  member_count: number;
}

export default function SidebarChatOptions({ setPageState }) {
  const { setShowJoinRoomModal, setShowCreateRoomModal } =
    useChatViewModelContext();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const rooms: ChatRoomListItemDto[] = [];
  rooms.push({ room_name: "Test 1", member_count: 2, is_private: false });
  rooms.push({ room_name: "Test 2", member_count: 4, is_private: true });
  rooms.push({ room_name: "Test 3", member_count: 7, is_private: false });

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
      {/* Temp button to change pages */}

      {/*/!* Join an existing chat *!/*/}
      {/*<ListItemButton>*/}
      {/*  <ListItemIcon>*/}
      {/*    <GroupAddIcon />*/}
      {/*  </ListItemIcon>*/}
      {/*  <ListItemText primary="Join Room" />*/}
      {/*</ListItemButton>*/}

      {/*/!* Create a new chat *!/*/}
      {/*<ListItemButton>*/}
      {/*  <ListItemIcon>*/}
      {/*    <AddCircleIcon />*/}
      {/*  </ListItemIcon>*/}
      {/*  <ListItemText primary="Create Room" />*/}
      {/*</ListItemButton>*/}

      {/*/!* Browse public chats via dropdown *!/*/}
      {/*<ListItemButton onClick={handleClick}>*/}
      {/*  <ListItemIcon>*/}
      {/*    <ListIcon />*/}
      {/*  </ListItemIcon>*/}
      {/*  <ListItemText primary="Browse Rooms" />*/}
      {/*  {open ? <ExpandLess /> : <ExpandMore />}*/}
      {/*</ListItemButton>*/}
      {/*<Collapse*/}
      {/*  in={open}*/}
      {/*  timeout="auto"*/}
      {/*  unmountOnExit*/}
      {/*>*/}
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

      {/* Populate this list with all open public chats */}
      {/*<List*/}
      {/*  component="div"*/}
      {/*  disablePadding*/}
      {/*>*/}
      {/*  {rooms.map((room, index) => (*/}
      {/*    <ChatRoomListItem room={room} />*/}
      {/*  ))}*/}
      {/*</List>*/}
      {/*</Collapse>*/}
    </List>
  );
}
