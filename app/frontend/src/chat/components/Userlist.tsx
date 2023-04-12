import React from "react";
import { Box, Avatar } from "@mui/material";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ContextMenuUsers from "../../components/ContextMenuUsers";
import { UserStatus } from "kingpong-lib";
import { UserListItem } from "../chat.types";

export interface UserListProps {
  userList: { [key: string]: UserListItem };
  handleClick: (e: React.MouseEvent, userData: UserListItem) => void;
}

export default function UserListView({ userList, handleClick }: UserListProps) {
  return (
    <>
      <Box
        id="userlist-container"
        sx={{
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
            sx={{
              minHeight: "5vh",
              backgroundColor: "rgb(31,31,31)"
            }}
          >
            <Box
              className="list-title"
              sx={{
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
            {Object.keys(userList).length === 0 && <Box>No one in chat </Box>}

            <List>
              {userList &&
                Object.entries(userList).map(([username, user]) => (
                  <ListItemButton
                    onContextMenu={(e) => handleClick(e, user)}
                    key={user.username}
                    onClick={(e) => {
                      handleClick(e, user);
                    }}
                  >
                    <ListItemIcon>
                      <Avatar src={`https://i.pravatar.cc/150?u=${username}`} />
                    </ListItemIcon>
                    <ListItemText
                      primary={username}
                      secondary={user.userStatus}
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
