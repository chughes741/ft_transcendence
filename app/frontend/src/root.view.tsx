import { Helmet } from "react-helmet";
import { Box, Container } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { RootViewModel } from "./root.viewModel";
import { usePageStateContext } from "./contexts/PageState.context";
import GameWindow from "./game/game.master";
import { PageState } from "./root.model";
import { useEffect } from "react";

/**
 * Helmet with dynamic page names
 * @param - Current page state
 * @returns - Helmet component
 */
function HelmetView({ state }) {
  const page_name = ["Home", "Game", "Chat", "Profile"];

  return (
    <>
      <Helmet>
        <title>King Pong | {page_name[state]}</title>
      </Helmet>
    </>
  );
}

/**
 * Rendering entrypoint
 * @returns - View model with dynamic content
 */
export function RootView(): JSX.Element {
  const { pageState, setPageState } = usePageStateContext();
  const diffFullScreen = PageState.FullScreenGame - PageState.Game;

  console.log(`Page state: ${pageState}`);
  // Handle keydown event
  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(`Keydown event: ${event.key}`);
    console.log(`Page state: ${pageState}`);
    if (event.key === "Escape" && pageState >= PageState.FullScreenGame) {
      console.log(
        `it worked! setting pagestate: ${pageState} to ${
          pageState - diffFullScreen
        }`
      );
      setPageState(pageState - diffFullScreen, "rootView"); //lol
    }
  };

  // Add event listener for keydown event
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pageState]);

  return (
    <>
      <HelmetView state={pageState} />
      <Container
        id="page-container"
        style={{ margin: "0", padding: "0", maxWidth: "100vw" }}
      >
        <Box
          id="page-box"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          {(pageState >= PageState.FullScreenGame && (
            <RootViewModel state={pageState - diffFullScreen} />
          )) || (
            <>
              <TopBar setPageState={setPageState} />
              <Box
                id="sidebar-container"
                sx={{ display: "flex" }}
              >
                <SideBar setPageState={setPageState} />
                <Box
                  component={"main"}
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  <RootViewModel state={pageState} />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}
