import { Button, Input, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { PageState } from "src/root.model";
import { useRootViewModelContext } from "src/root.context";
import "./Auth.tsx.css";
import "./Enable2FA.tsx.css";
import { socket } from "src/contexts/WebSocket.context";
import { headers } from "./Auth";
import { createBrowserHistory } from "history";
import { UserStatus } from "kingpong-lib";

//Prevent hazardous inputs
export const validateCode = (code: string): boolean => {
  const regex = /^[a-zA-Z0-9]+$/;

  if (code.length !== 6 || !regex.test(code)) {
    alert("The code must have 6 numerical characters. Try again.");
    return false;
  }
  return true;
};

export default function Verify2FA() {
  const {
    setPageState,
    setFullscreen,
    sessionToken,
    setSelf,
    self,
    setSessionToken
  } = useRootViewModelContext();

  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  setFullscreen(true);

  const handleGetQRCode = async (): Promise<boolean> => {
    try {
      const url = "/auth/qrCode";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "client-id": socket.id,
          "client-token": sessionToken
        }
      });
      const data = await response.json();
      if (data.statusCode && data.statusCode === 401) {
        //UNAUTHORIZED
        fetch(`/auth/deleteToken?socketId=${socket.id}`, {
          method: "POST"
        });
        setSessionToken("");
        setPageState(PageState.Auth);
        setSelf({
          username: "",
          avatar: "",
          createdAt: "",
          status: UserStatus.ONLINE
        });
        return;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleVerifyQRCode = async (): Promise<boolean> => {
    try {
      if (!validateCode(code)) return;
      const url = `/auth/verifyQrCode?secret=${null}&code=${code}&username=${
        self.username
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "client-id": socket.id,
          "client-token": sessionToken
        }
      });
      const data = await response.json();
      if (data.validated) {
        setErrorMessage("");
        alert("Verification successful!");
        setPageState(PageState.Home);
        return true;
      }
      if (data.statusCode && data.statusCode === 401) {
        //Unautorized token
        await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
          method: "POST",
          headers
        });
        setSessionToken("");
        setPageState(PageState.Auth);
        setSelf({
          username: "",
          avatar: "",
          createdAt: "",
          status: UserStatus.ONLINE
        });
        return;
      } else {
        alert("There was an error with the code you provided");
        setErrorMessage(data.message);
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    handleGetQRCode().then();
  }, []);

  return (
    <>
      <Box className="body-page-auth qr-body-page">
        <Box className="lines">
          <Box className="line" />
          <Box className="line" />
          <Box className="line" />
        </Box>
        <Box className="login-details">
          <Box className="input-container">
            <Typography variant={"h4"}>
              Check you authenticator app, and write down your validation code
              below
            </Typography>
            <Input
              className="input-verify-qr"
              required={true}
              autoFocus={true}
              inputProps={{ maxLength: 6 }}
              id="code"
              placeholder="Validation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          </Box>
          <Box className="buttons-container">
            <Button
              variant={"outlined"}
              sx={{
                border: "1px solid #9f9f9f",
                width: "20vw",
                height: "5vh",
                fontSize: "1.7rem",
                color: "#FA7F08",
                margin: "1rem",
                padding: "0.4rem",
                alignSelf: "center",
                cursor: "pointer",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#FA7F08",
                  color: "#131313",
                  opacity: "0.75"
                }
              }}
              onClick={handleVerifyQRCode}
            >
              Verify my code
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
