import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";

interface BannerProps {
  username: string;
  onLoginAsSomeoneElse: (newUsername: string) => void;
}

const DevLoginBanner: React.FC<BannerProps> = ({
  username,
  onLoginAsSomeoneElse
}) => {
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onLoginAsSomeoneElse(newUsername);
    setNewUsername("");
    setOpen(false);
  };

  return (
    <div
      style={{
        backgroundColor: "grey",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        height: "50px",
        width: "100%",
        zIndex: 3000
      }}
    >
      <div>Logged in as {username}</div>
      <Button
        onClick={handleClickOpen}
        variant="contained"
      >
        Login as someone else
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Choose a New Username</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a new username to log in as someone else.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Username"
            type="text"
            fullWidth
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DevLoginBanner;
