import { Helmet } from "react-helmet";
import { Box, Container } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { useRootViewModelContext } from "./root.context";
import { PageState } from "./root.model";
import GameWindow from "./game/game.master";
import { ChatView } from "./chat/chat.view";
import ProfileView from "./profile/profile.view";

/**
 * Helmet with dynamic page names
 *
 * @todo - Move to /components
 * @returns {JSX.Element} - Helmet with dynamic page names
 */
function HelmetView(): JSX.Element {
  const { pageState } = useRootViewModelContext();

  return (
    <>
      <Helmet>
        <title>King Pong | {pageState}</title>
      </Helmet>
    </>
  );
}

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
        </Box>
      </Container>
    </>
  );
}
