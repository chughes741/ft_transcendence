/** Libraries */
import { useEffect } from "react";
import { Box, Container } from "@mui/material";

/** Providers */
import { useRootViewModelContext } from "./root.context";

/** Components */
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { PageState } from "./root.model";
import { ChatView } from "./chat/chat.view";
import ProfileView from "./profile/profile.view";
import { HelmetView } from "./components/Helmet";
import SettingsView from "./components/settings/settings.view";
import Auth from "./components/Auth";
import { ChooseUsernameModal } from "./components/ChooseUsernameModal";
import GameWindow from "./game/game.view";
import Enable2FA from "./components/Enable2FA";
import Verify2FA from "./components/Verify2FA";
import { socket, useWebSocketContext } from "./contexts/WebSocket.context";
import { createBrowserHistory } from "history";
import { ConfirmationModal } from "./components/ConfirmationModal";
import {
  GameViewModelContext,
  useGameViewModelContext
} from "./game/game.viewModel";
import { UserStatus } from "kingpong-lib";

/**
 * Root view content
 *
 * @returns {JSX.Element} - Root view content
 */

function RootViewContent(): JSX.Element {
  const { pageState, setFullscreen } = useRootViewModelContext();
  switch (pageState) {
    case PageState.Auth: {
      setFullscreen(true);
      return <Auth />;
    }
    case PageState.Verify2FA: {
      setFullscreen(true);
      return <Verify2FA />;
    }
    case PageState.Enable2FA: {
      setFullscreen(true);
      return <Enable2FA />;
    }
    case PageState.Home: {
      setFullscreen(false);
      return <div></div>;
    }
    case PageState.Game: {
      setFullscreen(false);
      return <GameWindow />;
    }
    case PageState.Chat: {
      setFullscreen(false);
      return <ChatView />;
    }
    case PageState.Profile: {
      setFullscreen(false);
      return <ProfileView />;
    }
    default: {
      return <></>;
    }
  }
}

/**
 * Rendering entrypoint
 *
 * @returns {JSX.Element} - View model with dynamic content
 */
export function RootView(): JSX.Element {
  const {
    /* Fullscreen */
    fullscreen,
    setSessionToken,
    setPageState,
    setSelf,
    self,
    /* Username */
    showChooseUsernameModal,
    displayGameInvite,
    setDisplayGameInvite
  } = useRootViewModelContext();
  const { inviter, setInviter, setDisplayQueue } = useGameViewModelContext();
  const { addSocketListener, removeSocketListener } = useWebSocketContext();
  const history = createBrowserHistory();
  const handleSetSocketHandler = () => {
    const handleUnauthorized = async () => {
      await fetch(`/auth/deleteToken?socketId=${socket.id}`, {
        method: "POST"
      });
      setSessionToken("");
      setPageState(PageState.Auth);
      history.replace("/auth");
      setSelf({
        username: "",
        avatar: "",
        createdAt: "",
        status: UserStatus.ONLINE
      });
    };
    addSocketListener("unauthorized", handleUnauthorized);
  };

  //Listens to unauthorized error message sent by the backend
  useEffect(() => {
    handleSetSocketHandler();
    return () => {
      removeSocketListener("unauthorized");
    };
  }, [socket]);

  //Add listener for gameInvite
  socket.on("sendGameInviteEvent", (payload: any) => {
    if (payload.invited_username === self.username) {
      console.log("Game invite received");
      //Enable the modal
      setDisplayGameInvite(true);
  
      //Store the inviters name
      setInviter(payload.inviter_username);
      setDisplayQueue(true);
    }
  });

  return (
    <>
      <HelmetView />
      <SettingsView />
      <Container
        id="page-container"
        style={{ margin: "0", padding: "0", maxWidth: "100vw" }}
      >
        <Box
          id="page-box"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          {(fullscreen && <RootViewContent />) || (
            <>
              <TopBar />
              <Box
                id="sidebar-container"
                sx={{ display: "flex" }}
              >
                <SideBar />
                <Box
                  component={"main"}
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  <RootViewContent />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Container>
      <ChooseUsernameModal showModal={showChooseUsernameModal} />
      <ConfirmationModal
        showModal={displayGameInvite}
        message={"You have been invited to a game by " + inviter}
      />
    </>
  );
}
