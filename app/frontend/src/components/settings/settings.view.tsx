import { Box, Modal, Typography } from "@mui/material";
import ImgUpload from "src/components/ImgUpload";
import Enable2FAButton from "../Enable2FAButton";
import { useSettingsViewModelContext } from "./settings.viewModel";

/**
 * SettingsView
 *
 * @returns {JSX.Element}
 */
export default function SettingsView() {
  const { open, handleCloseSettings } = useSettingsViewModelContext();

  return (
    <>
      <Modal
        open={open}
        onClose={handleCloseSettings}
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
          <Enable2FAButton enabled={true} />
        </Box>
      </Modal>
    </>
  );
}
