import { useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { headers } from "./Login42";
import { socket } from "src/contexts/WebSocket.context";

interface Props {
  enabled: boolean;
}

export default function TwoFactorButton({ enabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { self, setSelf, setSessionToken, setPageState, setFullscreen } =
    useRootViewModelContext();

  const onToggle = async () => {
    setIsLoading(true);
    const url = `/auth/update2FA?username=${self.username}`;
    console.log("With headers", headers);
    const response = await fetch(url, {
      method: "GET",
      headers
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
      setFullscreen(true);
      setSelf(null);
      return;
    }
    console.log(data);
    setIsLoading(false);
  };

  /*
    const handleClick = async () => {
        setIsLoading(true);
        await onToggle();
        setIsLoading(false);
    };*/

  return (
    <Button
      variant="contained"
      onClick={onToggle}
      startIcon={enabled ? <ArrowBack /> : <ArrowBackIosNew />}
      disabled={isLoading}
    >
      {enabled ? "Disable Two Factor" : "Enable Two Factor"}
    </Button>
  );
}