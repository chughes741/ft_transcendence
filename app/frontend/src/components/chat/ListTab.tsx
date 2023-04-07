import "./ListTab.tsx.css";
import { Box, Typography, AppBar, Avatar } from "@mui/material";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from "@mui/material";
import { MouseEvent, useState, useEffect } from "react";
import { myUsers } from "./UserList";
import GroupIcon from "@mui/icons-material/Group";
import { useChatViewModelContext } from "../../pages/chat/contexts/ChatViewModelContext";

interface Props {
  users: myUsers[];
  heading: string;
  onSelectItem: (user: myUsers) => void;
}

function ListTabulation({ users, heading, onSelectItem }: Props) {
  //State hook: means that this function will have variable that will change over time.
  //if the change of our function is updated, React will automatically update the DOM for us
  //const [SelectedIndex, setSelectedIndex] = useState(-1);// Variable (SelectedIndex) and updater function
  // const [name, setName ] = useState(''); this could be use to modify also the state of the name

  const [SelectedIndex, setSelectedIndex] = useState(-1);
  const { contextMenuPosition, handleContextMenu, handleContextMenuUsers } =
    useChatViewModelContext();
  return (
    <>
      <Box
        id="userlist-container"
        style={{
          height: "100%",
          position: "relative",
          right: "0",
          width: "16vw",
          wordWrap: "break-word"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "16vw",
            wordWrap: "breakword"
          }}
        >
          <Box
            style={{
              minHeight: "5vh",
              justifySelf: "center",
              backgroundColor: "rgb(31,31,31)"
            }}
          >
            <Box
              className="list-title"
              style={{
                fontSize: "1rem",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <ListItemIcon>
                <GroupIcon color="secondary" />
              </ListItemIcon>
              {heading}
            </Box>
          </Box>
          {users.length === 0 && <Box>No one in chat </Box>}

          <List
            onContextMenu={(e) => handleContextMenuUsers(e, { name: "FUCK" })}
          >
            {users.map((users, index) => (
              <ListItemButton
                selected={SelectedIndex === index ? true : false}
                key={users.username} //don't forget to add user.id unique key
                onClick={() => {
                  setSelectedIndex(index);
                  onSelectItem(users);
                }}
              >
                <ListItemIcon>
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${users.username}`}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={users.username}
                  secondary={users.userStatus}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>
    </>
  );
}

export default ListTabulation;
