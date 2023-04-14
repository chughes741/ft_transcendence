import { useState, useEffect } from "react";
import { Button } from "@mui/material";

const CLIENT_ID =
  "u-s4t2ud-51fb382cccb5740fc1b9129a3ddacef8324a59dc4c449e3e8ba5f62acb2079b6";
const CLIENT_SECRET =
  "23a8bf4322ff2bc64ca1f076599b479198db24e5327041ce65735631d6ee8875";
const REDIRECT_URI = "http://localhost:3000/";

interface LoginWith42ButtonProps {
  onSuccess: (accessToken: string) => void;
  onFailure: (error: Error) => void;
}

function LoginWith42Button({ onSuccess, onFailure }: LoginWith42ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);


  // Step 2: Handle the authorization code and exchange it for an access token
    const handleAuthorizationCode = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const authorizationCode = searchParams.get("code");

      if (!authorizationCode) {
        onFailure(new Error("Authorization code not found"));
        return;
      }

      try {
        console.log("Before Trying to get token");
        const url = `http://localhost:3000/auth/token?code=${authorizationCode}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        console.log(response);

        if (!response.ok) {
          const error = await response.json();
          onFailure(new Error(error.error_description));
          return;
        }

        const data = await response.json();
        onSuccess(data.access_token);
      } catch (error) {
        onFailure(error);
      }
    };

    const handleLoginClick = () => {
      setIsLoading(true);
  
      // Step 1: Redirect the user to the 42 OAuth authorization endpoint
      const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
      window.location.href = authorizationUrl;
      handleAuthorizationCode();
    };

  return (
    <>
      <span>Log in only option :    </span>
      <Button
        onClick={handleLoginClick}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login with 42"}
      </Button>
    </>
  );
}

export default LoginWith42Button;
