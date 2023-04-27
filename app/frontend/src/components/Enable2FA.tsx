import { Input } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { PageState } from "src/root.model";
import { useRootViewModelContext } from "src/root.context";
import "./Auth.tsx.css";
import "./Enable2FA.tsx.css";
import { socket } from "src/contexts/WebSocket.context";
import { headers } from "./Auth";
import { createBrowserHistory } from "history";

export default function Enable2FA() {
  const {
    setPageState,
    sessionToken,
    setSelf,
    self,
    setSessionToken,
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
          "Content-Type": "application/json"
          //"client-id": socket.id,
          //"client-token": sessionToken,
        }
      });
      const data = await response.json();
      setQRCode(data["qrcode"]);
      setSecret(data["secret"]);

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleVerifyQRCode = async (): Promise<boolean> => {
    try {
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
          <Box className="title-qr">Verify QR Code</Box>
          {qrCode && (
            <img
              className="image-qr"
              src={qrCode}
              alt="QR Code"
            />
          )}
          <Input
            className="input-verify-qr"
            type="text"
            inputProps={{ maxLength: 6 }}
            id="code"
            placeholder="Enter your verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <Box
            className="button-verify-qr"
            onClick={handleVerifyQRCode}
          >
            Authenticate me
          </Box>
        </Box>
        <Box
          sx={{ alignSelf: "flex-start" }}
          onClick={cancel}
        >
          CANCELLLLL
        </Box>
      </Box>
    </>
  );
}
