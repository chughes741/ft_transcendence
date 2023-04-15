import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
  DialogActions
} from "@mui/material";
import { DevError } from "../chat/chat.types";
import { handleSocketErrorResponse } from "../chat/lib/helperFunctions";

interface ChooseUsernameModalProps {
  showModal: boolean;
  defaultUsername: string;
  pickUsername: (username: string) => void;
}

export const ChooseUsernameModal: React.FC<ChooseUsernameModalProps> = ({
  showModal,
  pickUsername,
  defaultUsername = "schlurp"
}) => {
  if (!showModal) return null;

  const [username, setUsername] = useState<string>(null);

  const handleSubmit = useCallback(async () => {
    const trimmedUsername = username.trim();

    pickUsername(
      trimmedUsername.length > 0 ? trimmedUsername : defaultUsername
    );
    setUsername(null);
  }, [username, setUsername]);

  return (
    <Dialog
      open={showModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "35%",
          overflowX: "hidden"
        }
      }}
      disableEscapeKeyDown
    >
      <DialogTitle alignContent={"center"}>Choose a username</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter a different username or use the default one:
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={username ? "Username" : defaultUsername}
          type="text"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ maxLength: 25 }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
