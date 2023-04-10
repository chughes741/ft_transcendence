/*******************/
/*     System      */
/*******************/
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  IconButton,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  Button,
  DialogActions
} from "@mui/material";
import React, { useState, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import ButtonFunky from "../../../components/ButtonFunky";
// import Button from "../../../components/Button";

/***************/
/*     CSS     */
/***************/
import "../styles/ChatPage.css";
import { useRoomModal } from "./useRoomModal";

interface CreateRoomModalProps {
  showModal: boolean;
  closeModal: () => void;
  onCreateRoom: (
    roomName: string,
    roomStatus: "PUBLIC" | "PRIVATE" | "PASSWORD", // This will need an enum :cry:
    password: string
  ) => Promise<boolean>;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showModal,
  closeModal,
  onCreateRoom
}) => {
  // const classes = useStyles();
  const [roomStatus, setRoomStatus] = useState<
    "PUBLIC" | "PRIVATE" | "PASSWORD"
  >("PUBLIC"); // defaults to public

  // Improves code re-usability btw Create and Join RoomModals
  const {
    roomName,
    setRoomName,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility
  } = useRoomModal(showModal, closeModal);

  const handleSubmit = useCallback(async () => {
    if (roomName.trim().length <= 0) {
      alert("Please enter a room name.");
      return;
    }
    // Necessary check b/c we're not using a `form`, but a `button` w `onClick`
    if (roomStatus === "PASSWORD" && !password) {
      alert("Please enter a room password.");
      return;
    }
    console.log("Creating room modal: ", roomName, roomStatus, password);
    const roomCreated = await onCreateRoom(roomName, roomStatus, password);
    if (roomCreated) {
      setRoomName("");
      setPassword("");
      closeModal();
    } else {
      alert(`Room creation failed on ${roomName}. Please try again.`);
    }
  }, [roomName, password, closeModal, onCreateRoom, roomStatus]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit().then();
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
      <DialogTitle alignContent={"center"}>Create New Chat Room</DialogTitle>
      <DialogContent
        // FIXME: add to global theme as dialogContent
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
          inputProps={{ maxLength: 25 }}
        />
        {roomStatus === "PASSWORD" && (
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
        )}
        <FormControl fullWidth>
          <InputLabel id="room-status-label">Room Status</InputLabel>
          <Select
            labelId="room-status-label"
            id="room-status"
            value={roomStatus}
            label="Room Status"
            onChange={(e) =>
              setRoomStatus(e.target.value as "PUBLIC" | "PRIVATE" | "PASSWORD")
            }
          >
            <MenuItem value="PUBLIC">Public</MenuItem>
            <MenuItem value="PRIVATE">Private</MenuItem>
            <MenuItem value="PASSWORD">Password Protected</MenuItem>
          </Select>
        </FormControl>
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
          content="Create Room"
          width="50%"
        ></ButtonFunky>
      </DialogActions>
    </Dialog>
  );
};
