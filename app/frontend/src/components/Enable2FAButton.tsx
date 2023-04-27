// import React, { useEffect, useState } from "react";
// import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
// import { Button } from "@mui/material";
// import { useRootViewModelContext } from "src/root.context";
// import { PageState } from "src/root.model";
// import { headers } from "./Login42";
// import { socket } from "src/contexts/WebSocket.context";
// import VerifyQRCode from "src/components/QrCodeElement";
//
// interface Props {
//   enabled: boolean;
// }
//
// export default function TwoFactorButton({ enabled }: Props) {
//   const [isLoading, setIsLoading] = useState(false);
//   const { self, setSelf, setSessionToken, setPageState, setFullscreen } =
//     useRootViewModelContext();
//   let qr = false;
//
//   const onToggle =()=> {
//     setIsLoading(true);
//     qr = true;
//     // const url = `/auth/update2FA?username=${self.username}`;
//     // console.debug("With headers", headers);
//     // const response = await fetch(url, {
//     //   method: "GET",
//     //   headers
//     // });
//     // const data = await response.json();
//     // if (data.statusCode && data.statusCode === 401) {
//     //   //UNAUTHORIZED EXCEPTION
//     //   //MUST FLUSH THE session TOKEN and bring back to login page
//     //   await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
//     //     method: "POST",
//     //     headers
//     //   });
//     //   setSessionToken("");
//     //   setPageState(PageState.Auth);
//     //   setFullscreen(true);
//     //   setSelf({ username: "", avatar: "", createdAt: "", status: 0 });
//     //   return;
//     // }
//     setIsLoading(false);
//   };
//
//   /*
//     const handleClick = async () => {
//         setIsLoading(true);
//         await onToggle();
//         setIsLoading(false);
//     };*/
//
//   useEffect(() => {
//     onToggle();
//   }, []);
//   return (
//     <>
//       <Button
//         variant="contained"
//         onClick={onToggle}
//         startIcon={enabled ? <ArrowBack /> : <ArrowBackIosNew />}
//         disabled={isLoading}
//       >
//         {enabled ? "Disable Two Factor" : "Enable Two Factor"}
//       </Button>
//       {qr && <VerifyQRCode />}
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { ArrowBack, ArrowBackIosNew } from "@mui/icons-material";
import { Button, Box } from "@mui/material";
import { useRootViewModelContext } from "src/root.context";
import { PageState } from "src/root.model";
import { headers } from "./Login42";
import { socket } from "src/contexts/WebSocket.context";
import VerifyQRCode from "src/components/QrCodeElement";
import { useSettingsViewModelContext } from "./settings/settings.viewModel";

interface Props {
  enabled: boolean;
}

export default function TwoFactorButton({ enabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [qr, setQr] = useState<boolean>(false);
  const { setPageState, fullscreen, setFullscreen, self, sessionToken } = useRootViewModelContext();
  const { handleCloseSettings } = useSettingsViewModelContext();
  const [enable2fa, setEnable2fa] = useState<boolean>(false);

  const onToggle = async () => {
    // if (ta fonction me dit que le 2fa est pas enabled)
    setFullscreen(true);
    setPageState(PageState.Enable2fa)
    setQr((prevQr) => !prevQr);
    handleCloseSettings();
    // sinon juste le disabler
  };

  //Gets the 2fa value upon rendering the component
  useEffect(() => {
    async function getenable2Fa() {
      const url = `/auth/getEnable2fa?username=${self.username}`
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
    getenable2Fa();
  }, []);

  return (
    <>
      <Button
        variant="contained"
        onClick={onToggle}
        startIcon={enable2fa ? <ArrowBack /> : <ArrowBackIosNew />}
        disabled={isLoading}
      >
        {enabled ? "Disable Two Factor" : "Enable Two Factor"}
      </Button>
    </>
  );
}
