import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  Avatar,
  Badge,
  MenuItem,
  TextField,
  Autocomplete,
  DialogContent,
  DialogActions,
  Button,
  ListItemText
} from "@mui/material";
import { socket } from "../../contexts/WebSocket.context";
import { UserStatus } from "kingpong-lib";
import { useChatContext } from "../chat.context";

interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

interface DirectMessageModalProps {
  showModal: boolean;
  closeModal: () => void;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  showModal,
  closeModal
}) => {
  const { tempUsername } = useChatContext();
  const [availableUsers, setAvailableUsers] = useState<UserEntity[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserEntity | null>(null);

  const handleSendDirectMessage = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }
    // FIXME: implement direct message logic
    console.log("Sending direct message to: ", selectedUser.username);

    setSelectedUser(null);
    closeModal();
  };

  useEffect(() => {
    console.log("Fetching available users...");
    socket.emit("listAvailableUsers", "", (users: UserEntity[]) => {
      console.log("Available users: ", users);
      setAvailableUsers(users);
      setSelectedUser(null);
    });
  }, [tempUsername, showModal]);

  if (!showModal) {
    return null;
  }

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "35%",
          overflowX: "hidden"
        }
      }}
    >
      <DialogTitle alignContent={"center"}>Send Direct Message</DialogTitle>
      <DialogContent>
        <Autocomplete
          id="user-autocomplete"
          options={availableUsers}
          getOptionLabel={(option) => option.username}
          value={selectedUser}
          renderOption={(props, option) => (
            <MenuItem {...props}>
              <Badge
                color={
                  option.status === UserStatus.ONLINE
                    ? "success"
                    : option.status === UserStatus.OFFLINE
                    ? "error"
                    : "warning"
                }
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                overlap="circular"
                variant="dot"
              >
                <Avatar
                  alt={option.username}
                  src={option.avatar}
                  sx={{ width: 40, height: 40, marginRight: 1 }}
                />
              </Badge>
              <ListItemText primary={option.username} />
            </MenuItem>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Users"
              variant="outlined"
              margin="normal"
              fullWidth
            />
          )}
          onChange={(event, value) => setSelectedUser(value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeModal}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSendDirectMessage}
          color="primary"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};
