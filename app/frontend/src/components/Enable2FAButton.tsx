import React, { useEffect, useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { socket } from "src/contexts/WebSocket.context";
import { useSettingsViewModelContext } from "./settings/settings.viewModel";

interface Props {
  enabled: boolean;
}

export default function Enable2FAButton({ enabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [qr, setQr] = useState<boolean>(false);
  const { setPageState, self, sessionToken } = useRootViewModelContext();
  const { handleCloseSettings } = useSettingsViewModelContext();
  const [enable2fa, setEnable2fa] = useState<boolean>(false);

  const onToggle = async () => {
    if (!enable2fa) {
      setPageState(PageState.Enable2FA);
      setQr((prevQr) => !prevQr);
      handleCloseSettings();
    } else {
      setEnable2fa(false);
      const url = `/auth/update2FA?username=${self.username}`;
      await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "client-id": socket.id,
          "client-token": sessionToken
        }
      });
    }
  };

  //Gets the 2fa value upon rendering the component
  useEffect(() => {
    async function getEnable2Fa() {
      const url = `/auth/getEnable2fa?username=${self.username}`;
      const enable = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "client-id": socket.id,
          "client-token": sessionToken
        }
      });
      const data = await enable.json();
      setEnable2fa(data.validated);
    }
    getEnable2Fa().then();
  }, []);

  return (
    <>
      <Box
        sx={{
          alignSelf: "center",
          margin: "2rem 0 1.5rem 0",
          color: "#c1c1c1"
        }}
      >
        {enable2fa
          ? "Disable two factor authentication"
          : "Enable two factor authentication"}
      </Box>
      <Button
        variant="outlined"
        onClick={onToggle}
        startIcon={enable2fa ? <ArrowBack /> : <ArrowBackIosNew />}
        disabled={isLoading}
        sx={{
          alignSelf: "center",
          border: "1px solid #9f9f9f",
          width: "15vw",
          fontSize: "1rem",
          color: "#FA7F08",
          padding: "0.4rem",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#FA7F08",
            color: "#131313",
            opacity: "0.75"
          }
        }}
      >
        {enable2fa ? "Disable Two Factor" : "Enable Two Factor"}
      </Button>
    </>
  );
}
