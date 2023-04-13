import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  IconButton,
  Button,
  DialogActions
} from "@mui/material";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRoomModal } from "./useRoomModal";
import { useRoomManager } from "../lib/roomManager";
import { useChatContext } from "../chat.context";
import { ChatRoomStatus } from "../chat.types";

interface RoomPasswordModalProps {
  showModal: boolean;
  closeModal: () => void;
}

export const RoomPasswordModal: React.FC<RoomPasswordModalProps> = ({
  showModal,
  closeModal
}) => {
  if (!showModal) {
    return null;
  }

  const { password, setPassword, showPassword, togglePasswordVisibility } =
    useRoomModal(showModal, closeModal);

  const { handleChangeRoomStatus } = useRoomManager();
  const { contextMenuData: room } = useChatContext();
  const roomName = room.name;

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] =
    useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    if (newPassword !== newPasswordConfirm) {
      alert("New password and confirmation do not match.");
      return;
    }

    const success = await handleChangeRoomStatus(
      roomName,
      ChatRoomStatus.PASSWORD,
      password,
      newPassword
    );
    if (success) {
      setPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      closeModal();
    } else {
      alert("Failed to change password. Please try again.");
    }
  }, [password, newPassword, newPasswordConfirm, closeModal]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit().then();
    }
    if (e.key === "Escape") {
      closeModal();
    }
  };

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
        {roomName} - Change Password
      </DialogTitle>
      <DialogContent
        sx={{
          "& > *:not(:last-child)": {
            marginBottom: 2
          }
        }}
      >
        {room.status === ChatRoomStatus.PASSWORD && (
          <TextField
            autoFocus
            margin="dense"
            label="Old Password"
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
        <DialogContentText>Enter new password:</DialogContentText>
        <TextField
          margin="dense"
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            endAdornment: (
              <IconButton
                edge="end"
                onClick={togglePasswordVisibility}
              >
                {showNewPassword ? <FiEye /> : <FiEyeOff />}
              </IconButton>
            )
          }}
        />
        <TextField
          margin="dense"
          label="Confirm New Password"
          type={showNewPasswordConfirm ? "text" : "password"}
          fullWidth
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            endAdornment: (
              <IconButton
                edge="end"
                onClick={() =>
                  setShowNewPasswordConfirm(!showNewPasswordConfirm)
                }
              >
                {showNewPasswordConfirm ? <FiEye /> : <FiEyeOff />}
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
        <Button
          onClick={handleSubmit}
          color="secondary"
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};
