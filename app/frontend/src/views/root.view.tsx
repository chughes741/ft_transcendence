import { useState } from "react";
import { Helmet } from "react-helmet";
import { Box, Container } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { RootViewModel } from "./root.viewModel";
import { PageState } from "./root.model";

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
export function RootView() {
  const [pageState, setPageState] = useState(PageState.Home);

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
          <TopBar setPageState={setPageState} />
          <Box id="sidebar-container"
            sx={{ display: "flex" }}>
            <SideBar setPageState={setPageState} />
            <Box component={"main"}>
              <RootViewModel state={pageState} />
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
