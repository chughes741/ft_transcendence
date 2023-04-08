import React, { useState } from "react";
import { Box, Avatar } from "@mui/material";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ContextMenuUsers from "../../../components/ContextMenuUsers";
import "../../../components/chat/ListTab.tsx.css";
import { UserListProps } from "./Userlist.model";

export default function UserListView(userListProps: UserListProps) {
  const [SelectedIndex, setSelectedIndex] = useState(-1);
  return (
    <>
      <Box
        id="userlist-container"
        style={{
          height: "100%",
          position: "fixed",
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
            wordWrap: "break-word"
          }}
        >
          <Box
            style={{
              minHeight: "5vh",
              backgroundColor: "rgb(31,31,31)"
            }}
          >
            <Box
              className="list-title"
              style={{
                fontSize: "1rem",
                maxWidth: "16vw",
                display: "flex",
                alignItems: "center",
                height: "5vh"
              }}
            >
              <GroupIcon
                style={{ margin: "1rem" }}
                color="secondary"
              />
              <p>Members List</p>
            </Box>
          </Box>
          <Box
            id="members-container"
            style={{
              maxHeight: "75vh",
              overflowY: "auto",
              overflowX: "hidden"
            }}
          >
            {userListProps.userList.length === 0 && <Box>No one in chat </Box>}

            <List>
              {userListProps.userList.map((users, index) => (
                <ListItemButton
                  onContextMenu={(e) => userListProps.handleClick(users[index])}
                  selected={SelectedIndex === index}
                  //TODO don't forget to add user.id unique key
                  key={users.username}
                  onClick={() => {
                    setSelectedIndex(index);
                    userListProps.handleClick(users[index]);
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
      </Box>
      <ContextMenuUsers />
    </>
  );
}
