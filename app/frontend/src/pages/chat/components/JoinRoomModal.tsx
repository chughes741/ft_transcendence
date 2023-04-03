import React, { useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  IconButton,
  DialogActions
} from "@mui/material";
import { useRoomModal } from "./useRoomModal";
import ButtonFunky from "../../../components/ButtonFunky";

interface JoinRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onJoinRoom: (roomName: string, password: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  showModal,
  closeModal,
  onJoinRoom
}) => {
  const {
    roomName,
    setRoomName,
    password,
    setPassword,
    showPassword,
    roomNameInput,
    togglePasswordVisibility
  } = useRoomModal(showModal, closeModal);

  const handleSubmit = useCallback(() => {
    if (roomName.trim().length <= 0) {
      alert("Please enter a room name.");
      return;
    }
    console.log("Joining room modal: ", roomName, password);
    onJoinRoom(roomName, password);
    setRoomName("");
    setPassword("");
    closeModal();
  }, [roomName, password, closeModal, onJoinRoom]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      closeModal();
    }
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
      <DialogTitle alignContent={"center"}>Join Room</DialogTitle>
      <DialogContent
        sx={{
          "& > *:not(:last-child)": {
            marginBottom: 2
          }
        }}
      >
        <DialogContentText>Enter room details:</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Room Name"
          type="text"
          fullWidth
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <TextField
          margin="dense"
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            endAdornment: (
              <IconButton
                edge="end"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FiEye /> : <FiEyeOff />}
              </IconButton>
            )
          }}
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
          onClick={handleSubmit}
          content="Join Room"
          width="50%"
        ></ButtonFunky>
      </DialogActions>
    </Dialog>
  );
};
