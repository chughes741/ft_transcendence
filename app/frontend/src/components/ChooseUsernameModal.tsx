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
import { useRootViewModelContext } from "../root.context";

interface ChooseUsernameModalProps {
  showModal: boolean;
  defaultUsername: string;
  pickUsername: (username: string) => void;
}

function validateUsername(username: string): boolean {
  const minLength = 4;
  const maxLength = 20;
  const regex = /^[a-zA-Z0-9]+$/; // Only allow letters and numbers

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  if (!regex.test(username)) {
    return false;
  }

  return true;
}

export const ChooseUsernameModal: React.FC<ChooseUsernameModalProps> = ({
  showModal,
  pickUsername,
  defaultUsername = "default"
}) => {
  if (!showModal) return null;
  const [username, setUsername] = useState<string>("");
  
  const { self, setShowChooseUsernameModal, setFullscreen } = useRootViewModelContext();
  
  setFullscreen(true)
  const handleSubmit = useCallback(async () => {
    if (!validateUsername(username)){
      return
    }
    const trimmedUsername = username.trim();
    pickUsername("default");
    setUsername("");
    const url = `http://localhost:3000/auth/changeUsername?current=${self.username}&newname=${username}`;
    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const changeIsSuccess = await data.json();
    if (changeIsSuccess){
        setShowChooseUsernameModal(false);
        self.username = username;
    }
    else
      alert("holy fuck!")
    setFullscreen(false);
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
          Please choose a username :
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ maxLength: 25, minLenght: 5 }}
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
