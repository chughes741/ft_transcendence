import { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import { socket } from "../contexts/WebSocket.context";
import { ProfileEntity } from "kingpong-lib";

import VerifyQRCode from "./QrCodeElement";
import { PageState } from "src/root.model";
import { useRootViewModelContext } from "src/root.context";

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
  user: ProfileEntity,
  token: string,
  twoFAenable: boolean,
}

export default function LoginWith42Button() {
  const { setShowChooseUsernameModal,
    setFullscreen,
    sessionToken,
    setSessionToken,
    setSelf,
    setPageState,
    history
  } = useRootViewModelContext();

  const [isLoading, setIsLoading] = useState(false);

  const populateProfile = (data: AuthEntity): ProfileEntity => {

    // returns the profile of the response
    const profile: ProfileEntity = {
      username: data.user.username,
      avatar: data.user.avatar,
      status: data.user.status,
      createdAt: new Date().toLocaleString(),
    }
    return (profile)
  }

  // on success, set the session token and the self, and redirects to /home
  const onSuccess = (data: dataResponse) => {
    console.log(data);
    setSessionToken(data.token);
    setSelf(data.user);

    
    if (data.twoFAenable)
      setPageState(PageState.QRCode);
    else
      setPageState(PageState.Home);

    console.log("SESSION TOKEN", sessionToken)
    history.push("/");
  };

  // here is the useEffect to handle if theres an auth code, handles the call the backend with the authcode and socket id, 
  // and gets the response as an auth entity, containinh a user and a session token
  // if its the first connection, handles the change username modal and set the username in the db
  // if 2fa is enabled, request the 2fa validation before completion

  useEffect(() => {
    // Handle the authorization code and exchange it for an access token
    const handleAuthorizationCode = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const authorizationCode = searchParams.get("code");
      if (!authorizationCode) {
        new Error("Authorization code not found");
        return;
      }

      try {
        const socketId = socket.id;
        console.log("SOCKET ID", socketId);
        const url = `http://localhost:3000/auth/token?code=${authorizationCode}&socketId=${socketId}`;

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


        if (client.user.firstConnection)
          setShowChooseUsernameModal(true);

        else
          setFullscreen(false);


        if (client.user.enable2fa)
          setPageState(PageState.QRCode);
        console.log("INFORMATION  ", client);
        const userProfile: dataResponse = {
          user: populateProfile(client),
          token: client.token,
          twoFAenable: client.user.enable2fa,
        }
        console.log("USER PROFILE :", userProfile)
        onSuccess(userProfile);

      } catch (error) {
        new Error(error);
      }
    };
    handleAuthorizationCode();
  }, [onSuccess]);

  const handleLoginClick = () => {
    setIsLoading(true);
    // Redirect the user to the 42 OAuth authorization endpoint
    const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = authorizationUrl;
  };

  return (
    <>
      <Box className="body-page-auth" sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh"
      }}
      >
        <Box>Log in only option : </Box>
        <Button
          onClick={handleLoginClick}
          disabled={isLoading}
          disableRipple={true}
          disableFocusRipple={true}
        >
          {isLoading ? "Logging in..." : "Login with 42"}
        </Button>
      </Box>
    </>
  );
}