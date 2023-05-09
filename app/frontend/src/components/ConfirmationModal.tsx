import React, { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";
import { socket } from "src/contexts/WebSocket.context";
import { useRootViewModelContext } from "src/root.context";
import { useGameViewModelContext } from "src/game/game.viewModel";

interface ConfirmationModalProps {
  showModal: boolean;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  showModal,
  message
}) => {
  const { self, setDisplayGameInvite } =
    useRootViewModelContext();
  const { inviter } = useGameViewModelContext();
  if (!showModal) return null;

  const handleAccept = () => {
    console.warn("handleAccept");
    //Emit event to server
    socket.emit("acceptGameInviteEvent", {
      inviter_username: inviter,
      invited_username: self.username,
      isAccepted: true
    });
  };

  const handleDecline = () => {
    console.warn("handleDecline");

    //Emit event to server
    socket.emit("acceptGameInviteEvent", {
      inviter_username: inviter,
      invited_username: self.username,
      isAccepted: false
    });
  };
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDecline();
        setDisplayGameInvite(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleAccept();
        setDisplayGameInvite(false);
      }
    },
    [handleDecline, handleAccept]
  );

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal, handleDecline]);

  return (
    <Dialog
      open={showModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "25%",
          overflowX: "hidden"
        }
      }}
    >
      <DialogTitle alignContent={"center"}>Join Game?</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={handleDecline}
        >
          Decline
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAccept}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};
