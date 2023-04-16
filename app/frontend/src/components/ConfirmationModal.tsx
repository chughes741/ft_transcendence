import React, { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

interface ConfirmationModalProps {
  showModal: boolean;
  message: string;
  closeModal: () => void;
  onConfirmation: (confirmed: boolean) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  showModal,
  message,
  closeModal,
  onConfirmation
}) => {
  if (!showModal) return null;
  if (!onConfirmation) {
    // setShowConfirmationModal(false);
    return null;
  }

  const handleConfirm = () => {
    if (onConfirmation) {
      onConfirmation(true);
    }
  };

  const handleCancel = () => {
    console.warn("handleCancel");
    if (onConfirmation) {
      onConfirmation(false);
    }
  };
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
        closeModal();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
        closeModal();
      }
    },
    [handleCancel, handleConfirm, closeModal]
  );

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal, handleCancel, closeModal]);

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
      <DialogTitle alignContent={"center"}>Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
