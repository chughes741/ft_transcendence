import { Helmet } from "react-helmet";
import { Box, Container } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { RootViewModel } from "./root.viewModel";
import { useRootViewModelContext } from "./root.context";

/**
 * Helmet with dynamic page names
 *
 * @todo - Move to /components
 * @returns {JSX.Element} - Helmet with dynamic page names
 */
function HelmetView(): JSX.Element {
  const { pageState } = useRootViewModelContext();
  const page_name = ["Home", "Game", "Chat", "Profile"];

  return (
    <>
      <Helmet>
        <title>King Pong | {page_name[pageState]}</title>
      </Helmet>
    </>
  );
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
                <RootViewModel />
              </Box>
            </Box>
          </>
        </Box>
      </Container>
    </>
  );
}
