import React, { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";
import { useRootViewModelContext } from "../root.context";
import { useRootModel } from "../root.model";

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
  const {
    // confirmationCallback: onConfirmation,
    setShowConfirmationModal,
    confirmationMessage
  } = useRootViewModelContext();

  if (!showModal) return null;
  console.warn("onConfirmation", onConfirmation);
  console.warn("confirmationMessage", confirmationMessage);
  console.warn("onConfirmation", onConfirmation);
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
    if (onConfirmation) {
      onConfirmation(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleCancel();
          closeModal();
        }
      },
      [handleCancel, closeModal]
    );

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
