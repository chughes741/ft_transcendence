import { useState } from "react";
import { Box, Button, Modal, Typography } from "@mui/material";
import ImgUpload from "src/components/ImgUpload";

/**
 * SettingsView
 *
 * @returns {JSX.Element}
 */
export default function SettingsView() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h5"
            component="h2"
          >
            Settings
          </Typography>
          <ImgUpload />
        </Box>
      </Modal>
    </>
  );
}
