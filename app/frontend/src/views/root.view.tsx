import { useState } from "react";
import { Helmet } from "react-helmet";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import customTheme from "src/theme";
import { Box, Container, ThemeProvider } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import TopBar from "src/components/TopBar/TopBar";
import { RootViewModel } from "./root.viewModel";
import { ChatViewModelProvider } from "../pages/chat/ChatViewModel";

/**
 * Rendering entrypoint
 * @returns - View model with dynamic content
 */
export function RootView() {
  const [pageState, setPageState] = useState(0);

  /** Theme setup */
  const theme = customTheme();

  const page_name = ["Home", "Game", "Chat", "Profile"];

  return (
    <>
      <Helmet>
        <title>King Pong | {page_name[pageState]}</title>
      </Helmet>
      <Container
        id="page-container"
        style={{ margin: "0", padding: "0", maxWidth: "100vw" }}
      >
        <Box
          id="test1"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <TopBar setPageState={setPageState} />
          <Box id="sidebar-container">
            <SideBar setPageState={setPageState} />
          </Box>
          <RootViewModel state={pageState} />
        </Box>
      </Container>
    </>
  );
}
