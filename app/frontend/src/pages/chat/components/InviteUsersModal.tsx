import React from "react";
import {
  Dialog,
  DialogTitle,
  Avatar,
  Badge,
  MenuItem,
  ListItemText,
  TextField,
  Autocomplete,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
// import Autocomplete from "@mui/lab/Autocomplete";
import { UserStatus } from "kingpong-lib";
import ButtonFunky from "../../../components/ButtonFunky";
import { useChatViewModelContext } from "../contexts/ChatViewModelContext";
import { socket } from "../../../contexts/WebSocketContext";

export interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

export interface InviteUsersToRoomRequest {
  roomName: string;
  usernames: string[];
}

interface InviteUsersToRoomProps {
  showModal: boolean;
  closeModal: () => void;
  availableUsers: UserEntity[];
  selectedUsers: UserEntity[];
  setSelectedUsers: (users: UserEntity[]) => void;
}

export const InviteUsersModal: React.FC<InviteUsersToRoomProps> = ({
  showModal,
  closeModal,
  availableUsers,
  selectedUsers,
  setSelectedUsers
}) => {
  const { currentRoomName } = useChatViewModelContext();

  const handleInvite = () => {
    if (selectedUsers.length <= 0) {
      alert("Please select at least one user to invite.");
      return;
    }

    const req: InviteUsersToRoomRequest = {
      roomName: currentRoomName,
      usernames: selectedUsers.map((user) => user.username)
    };
    socket.emit("inviteUsersToRoom", req, (res: any) => {
      // TODO: implement user notification behavior based on the response
      console.log("Invite users response: ", res);
    });

    closeModal();
  };

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
          width: "30%",
          overflowX: "hidden"
        }
      }}
    >
      <DialogTitle alignContent={"center"}>
        Invite Users to Room ${currentRoomName}
      </DialogTitle>
      <DialogContent>
        <Autocomplete
          id="user-autocomplete"
          options={availableUsers}
          getOptionLabel={(option) => option.username}
          multiple
          value={selectedUsers}
          renderOption={(props, option) => (
            <MenuItem {...props}>
              <Badge
                color={
                  option.status === "ONLINE"
                    ? "success"
                    : option.status === "OFFLINE"
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
          onChange={(event, values) => setSelectedUsers(values)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeModal}
          color="primary"
        >
          Cancel
        </Button>
        <ButtonFunky
          onClick={handleInvite}
          content="Invite to Room"
          width="50%"
        />
      </DialogActions>
    </Dialog>
  );
};
