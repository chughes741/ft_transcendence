import { Input, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { PageState } from "src/root.model";
import { useRootViewModelContext } from "src/root.context";
import "./Auth.tsx.css";
import "./Enable2FA.tsx.css";
import { socket } from "src/contexts/WebSocket.context";
import { headers } from "./Auth";
import { createBrowserHistory } from "history";
import Button from "@mui/material/Button";
import { validateCode } from "./Verify2FA";

export default function Enable2FA() {
  const {
    setPageState,
    sessionToken,
    setSelf,
    self,
    setSessionToken,
    setFullscreen
  } = useRootViewModelContext();

  const [qrCode, setQRCode] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [secret, setSecret] = useState<string | null>(null);
  const history = createBrowserHistory();
  const [isCancelled, setCancelled] = useState<boolean>(false);

  const cancel = () => {
    history.back();
    //Here we need to be able not to go forward, history.destroy next or smthg
    setCancelled(true);
    return;
  };

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
        //UNAUTHORIZED EXCEPTION
        //MUST FLUSH THE session TOKEN and bring back to login page
        fetch(`/auth/deleteToken?socketId=${socket.id}`, {
          method: "POST"
        });
        setSessionToken("");
        setPageState(PageState.Auth);
        history.push("/auth");
        setFullscreen(true);
        setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
        return;
      }
      setQRCode(data["qrcode"]);
      setSecret(data["secret"]);

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleVerifyQRCode = async (): Promise<boolean> => {
    try {
      if (!validateCode(code)) return;
      const url = `/auth/verifyQrCode?secret=${secret}&code=${code}&username=${self.username}`;
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
        //UNAUTHORIZED EXCEPTION
        //MUST FLUSH THE session TOKEN and bring back to login page
        await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
          method: "POST",
          headers
        });
        setSessionToken("");
        setPageState(PageState.Auth);
        history.push("/auth");
        setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
        return;
      }
      if (data.validated) {
        setErrorMessage("");
        alert("Verification successful!");
        history.back();
        return true;
      } else {
        // alert("There was an error with the code you provided");
        setErrorMessage(data.message);
        alert("There was a problem with the code you provided.");
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
      <Box className="body-page-auth two-fa-body-page">
        <Box className="lines">
          <Box className="line" />
          <Box className="line" />
          <Box className="line" />
        </Box>
        <Box className="login-details">
          <Box className="title-two-fa">Enable 2 factor authentication</Box>
          <Box className="text-two-fa">
            Scan the QR code with your authenticator app and enter the
            validation code below
          </Box>
          {qrCode && (
            <img
              className="image-qr"
              src={qrCode}
              alt="QR Code"
            />
          )}
          <Box className="input-container">
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
                "&:hover": {backgroundColor: "#FA7F08", color:"#131313", opacity:"0.75" }
              }}
              onClick={handleVerifyQRCode}
            >
              Verify my code
            </Button>
            <Button
              variant={"outlined"}
              sx={{
                border: "1px solid #9f9f9f",
                width: "10vw",
                height: "5vh",
                fontSize: "1.7rem",
                color: "#F24404",
                margin: "1rem 2rem",
                padding: "0.4rem",
                alignSelf: "center",
                cursor: "pointer",
                textTransform: "none",
                "&:hover": {backgroundColor: "#F24404", color:"#131313", opacity:"0.75" }

              }}
              onClick={cancel}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
