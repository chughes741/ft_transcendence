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
import { UserStatus } from "kingpong-lib";
import ButtonFunky from "../../components/ButtonFunky";
import { useChatContext } from "../chat.context";
import { socket } from "../../contexts/WebSocket.context";
import UserStatusBadge from "../../components/UserStatusBadge";

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
  const { currentRoomName } = useChatContext();

  const handleInvite = () => {
    if (selectedUsers.length <= 0) {
      alert("Please select at least one user to invite.");
      return;
    }

    const req: InviteUsersToRoomRequest = {
      roomName: currentRoomName,
      usernames: selectedUsers.map((user) => user.username)
    };
    socket.emit("inviteUsersToRoom", req, (res: boolean | null) => {
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
          width: "35%",
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
              <UserStatusBadge
                status={option.status}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
              >
                <Avatar
                  alt={option.username}
                  src={option.avatar}
                  sx={{ width: 40, height: 40, marginRight: 1 }}
                />
              </UserStatusBadge>
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
