/** Libraries */
import { useEffect } from "react";
import { Box, Container } from "@mui/material";

/** Providers */
import { useRootViewModelContext } from "./root.context";

/** Components */
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { PageState } from "./root.model";
import GameWindow from "./game/game.master";
import { ChatView } from "./chat/chat.view";
import ProfileView from "./profile/profile.view";
import { HelmetView } from "./components/Helmet";

/**
 * Root view content
 *
 * @returns {JSX.Element} - Root view content
 */
function RootViewContent(): JSX.Element {
  const { pageState } = useRootViewModelContext();

  switch (pageState) {
    case PageState.Home: {
      return <div></div>;
    }
    case PageState.Game: {
      return <GameWindow />;
    }
    case PageState.Chat: {
      return <ChatView />;
    }
    case PageState.Profile: {
      return <ProfileView />;
    }
    default: {
      return <div></div>;
    }
  }
}

/**
 * Rendering entrypoint
 *
 * @returns {JSX.Element} - View model with dynamic content
 */
export function RootView(): JSX.Element {
  const { fullscreen, setFullscreen } = useRootViewModelContext();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && fullscreen) {
      console.log(`it worked! esc was pressed and fullscreen is ${fullscreen}`);
      setFullscreen(false);
    }
  };

  /** Add event listener for keydown event */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    /** Cleanup event listener on unmount */
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreen]);

  return (
    <>
      <HelmetView />
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
    </>
  );
}
