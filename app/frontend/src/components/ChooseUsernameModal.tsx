import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import { useRootViewModelContext } from "../root.context";

interface ChooseUsernameModalProps {
  showModal: boolean;
}

const validateUsername = (username: string): boolean => {
  const minLength = 3;
  const regex = /^[a-zA-Z0-9]+$/;

  if (username.length < minLength || !regex.test(username)) {
    alert(
      "The username must be between 3 and 20 characters, and can only contain letters and numbers. Please choose another one."
    );
    return false;
  }
  return true;
};

export const ChooseUsernameModal: React.FC<ChooseUsernameModalProps> = ({
  showModal
}) => {
  if (!showModal) return null;
  const { self, setSelf, setShowChooseUsernameModal, setFullscreen } =
    useRootViewModelContext();
  const [username, setUsername] = useState<string>("");

  setFullscreen(true);

  const handleSubmit = useCallback(async () => {
    if (!validateUsername(username)) return;

    const url = `http://localhost:3000/auth/changeUsername?current=${self.username}&newname=${username}`;
    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const changeIsSuccess = await data.json();
    if (!changeIsSuccess) {
      alert("This username is already taken, please choose another one.");
    } else {
      setSelf({
        username: username,
        avatar: self.avatar,
        status: self.status,
        createdAt: self.createdAt
      });
      setShowChooseUsernameModal(false);
    }
    setFullscreen(false);
  }, [username, setUsername, self, setSelf]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit().then();
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
        <DialogContentText>Please choose a username :</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ maxLength: 20 }}
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
