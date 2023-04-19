import { useState, useEffect } from "react";
import { Button,Box } from "@mui/material";
import { socket } from "../contexts/WebSocket.context";
import { ProfileEntity } from "kingpong-lib";
import { dataResponse } from "src/root.view";
import VerifyQRCode from "./QrCodeElement";
import { useRootViewModelContext } from "src/root.context";

const CLIENT_ID =
  "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
const REDIRECT_URI = "http://localhost:3000/";

interface LoginWith42ButtonProps {
  onSuccess: (data: dataResponse) => void;
  onFailure: (error: Error) => void;
}

// useEffect(() => {
//   function LoginWith42Button({ onSuccess, onFailure }: LoginWith42ButtonProps) {
//     const [isLoading, setIsLoading] = useState(false);

//     // Step 2: Handle the authorization code and exchange it for an access token
//     const handleAuthorizationCode = async () => {
//       const searchParams = new URLSearchParams(window.location.search);
//       const authorizationCode = searchParams.get("code");
//       console.log("Login 42 button")
//       if (!authorizationCode) {
//         onFailure(new Error("Authorization code not found"));
//         return;
//       }

//       // Remove the "code" query parameter from the URL
//       const newUrl = window.location.pathname + window.location.hash;
//       window.history.replaceState({}, "", newUrl);

//       try {
//         console.log("Before Trying to get token");
//         const socketId = socket.id;
//         const url = `http://localhost:3000/auth/token?code=${authorizationCode}&socketId=${socketId}`;
//         const response = await fetch(url, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json"
//           }
//         });
//         console.log("Response from 42 auth:", response);

//         if (!response.ok) {
//           const error = await response.json();
//           onFailure(new Error(error.error_description));
//           return;
//         }

//         const data = await response.json();
//         onSuccess(data.access_token);
//       } catch (error) {
//         onFailure(error);
//       }
//     };
//   }

//   const handleLoginClick = () => {
//     setIsLoading(true);

//     // Step 1: Redirect the user to the 42 OAuth authorization endpoint
//     const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
//     window.location.href = authorizationUrl;
//   };

//   return (
//     <>
//       <span>Log in only option : </span>
//       <Button
//         onClick={handleLoginClick}
//         disabled={isLoading}
//       >
//         {isLoading ? "Logging in..." : "Login with 42"}
//       </Button>
//     </>
//   );
// }

enum UserStatus {
  ONLINE,
  OFFLINE,
  AWAY
}

interface UserEntity {
  username: string;
  enable2fa? : boolean;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: UserStatus;
  firstConnection? : boolean;
  
}

interface AuthEntity {
  token: string;
  user: UserEntity;
}

export default function LoginWith42Button({ onSuccess, onFailure }: LoginWith42ButtonProps) {
  const { setShowChooseUsernameModal, setFullscreen } = useRootViewModelContext();

  const [isLoading, setIsLoading] = useState(false);

  const populateProfile = (data : AuthEntity) : ProfileEntity => {
    const profile : ProfileEntity  = {
      username : data.user.username,
      avatar: data.user.avatar,
      status: data.user.status,
      createdAt: new Date().toLocaleString(),
    }
    return (profile)
  }

  useEffect(() => {
    // Handle the authorization code and exchange it for an access token
    const handleAuthorizationCode = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const authorizationCode = searchParams.get("code");
      if (!authorizationCode) {
        onFailure(new Error("Authorization code not found"));
        return;
      }

      try {
        console.log("Before Trying to get token");
        const socketId = socket.id;
        const url = `http://localhost:3000/auth/token?code=${authorizationCode}&socketId=${socketId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        console.log("Response from 42 auth:", response);

        if (!response.ok) {
          const error = await response.json();
          onFailure(new Error(error.error_description));
          return;
        }

        const data  = await response.json();
        if (data.user.firstConnection)
          setShowChooseUsernameModal(true);
        else
          setFullscreen(false);
      //  else if (enable2fa)
        // VerifyQRCode

        const dataRes  = {
          user: populateProfile(data),
          token: data.access_token
        }
        onSuccess(dataRes);

      } catch (error) {
        onFailure(error);
      }
    };

    handleAuthorizationCode();
  }, [onSuccess, onFailure]);

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
            alignItems:"center", 
            justifyContent:"center", 
            width:"100vw", 
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