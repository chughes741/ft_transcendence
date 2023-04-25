import { useCallback, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { ProfileEntity } from "kingpong-lib";
import { PageState } from "src/root.model";
import { useRootViewModelContext } from "src/root.context";
import "./Login42.tsx.css";
import { socket } from "../contexts/WebSocket.context";
import { createBrowserHistory } from "history";

const CLIENT_ID =
  "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
const REDIRECT_URI = "http://localhost:3000/";

/*
 * We GOTTA add those to kingpong lib
 */

enum UserStatus {
  ONLINE,
  OFFLINE,
  AWAY
}

interface UserEntity {
  username: string;
  enable2fa?: boolean;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: UserStatus;
  firstConnection?: boolean;
}

interface AuthEntity {
  token: string;
  user: UserEntity;
}

export interface dataResponse {
  user: ProfileEntity;
  token: string;
  twoFAenable: boolean;
}

export const headers = {
  "client-id": null,
  "client-token": null
};

export default function LoginWith42Button() {
  const {
    setShowChooseUsernameModal,
    setFullscreen,
    sessionToken,
    setSessionToken,
    setSelf,
    self,
    setPageState
  } = useRootViewModelContext();

  const history = createBrowserHistory();
  if (sessionToken) {
    // add a check if the toke is still valid
    history.go(-3);
    return;
  }
  const [isLoading, setIsLoading] = useState(false);

  const populateProfile = (data: AuthEntity): ProfileEntity => {
    // returns the profile of the response
    return {
      username: data.user.username,
      avatar: data.user.avatar,
      status: data.user.status,
      createdAt: new Date().toLocaleString()
    };
  };

  // on success, set the session token and the self, and redirects to /
  const onSuccess = (data: dataResponse) => {
    setSessionToken(data.token);
    if (data.twoFAenable) setPageState(PageState.QRCode);
    else {
      history.replace("/");
      setPageState(PageState.Home);
    }
  };

  // here is the useEffect to handle if there is an auth code, handles the call the backend with the auth code and socket id,
  // and gets the response as an auth entity, containing a user and a session token
  // if it is the first connection, handles the change username modal and set the username in the db
  // if 2fa is enabled, request the 2fa validation before completion

  const handleAuthorizationCode = useCallback(async (): Promise<boolean> => {
    const searchParams = new URLSearchParams(window.location.search);
    const authorizationCode = searchParams.get("code");
    if (!authorizationCode) {
      new Error("Authorization code not found");
      return;
    }
    try {
      socket.on("connect", async () => {
        const url = `http://localhost:3000/auth/token?code=${authorizationCode}&socketId=${socket.id}`;

        const data = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!data.ok) {
          const error = await data.json();
          new Error(error);
          return;
        }
        const client = await data.json();
        if (client.user.firstConnection) setShowChooseUsernameModal(true);
        else setFullscreen(false);
        headers["client-id"] = socket.id;
        headers["client-token"] = client.token;
        const userProfile: dataResponse = {
          user: populateProfile(client),
          token: client.token,
          twoFAenable: client.user.enable2fa
        };
        setSelf(userProfile.user);
        console.debug("self: " , self);
        onSuccess(userProfile);
      });
    } catch (error) {
      new Error(error);
    }
  }, [socket, headers, onSuccess]);

  useEffect(() => {
    handleAuthorizationCode().then();
  }, [handleAuthorizationCode]);

  const handleLoginClick = () => {
    setIsLoading(true);
    // Redirect the user to the 42 OAuth authorization endpoint
    history.push(
      `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`
    );
  };

  return (
    <>
      <Box className="body-page-auth">
        <Box className="lines">
          <Box className="line" />
          <Box className="line" />
          <Box className="line" />
        </Box>

        <Box className="login-details">
          <Box className="login-text">
            Welcome to Schlurp's psychedelic ride. Enjoy yourself on the King
            Pong Island
          </Box>
          <Box className="container-button">
            <Box className="tag">Log in with 42 </Box>
            <Button
              variant={"outlined"}
              className="button-login"
              onClick={handleLoginClick}
              disabled={isLoading}
              disableRipple={true}
              disableFocusRipple={true}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
