import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
  DialogActions
} from "@mui/material";

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

  const [username, setUsername] = useState<string>("");

  const handleSubmit = useCallback(async () => {
    const trimmedUsername = username.trim();

    pickUsername(
      trimmedUsername.length > 0 ? trimmedUsername : defaultUsername
    );
    setUsername("");
  }, [username, setUsername]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal, handleSubmit]);

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
          label={username.length > 0 ? "Username" : defaultUsername}
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
