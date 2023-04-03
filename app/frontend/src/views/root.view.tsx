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
      <Box
        id="topbar-container"
      >
          <TopBar setPageState={setPageState} />
        </Box>
        <Box id="content-container" style={{width: "100%", height: "fit-content"}}>
          <Box id="sidebar-container">

            <SideBar setPageState={setPageState} />
          </Box>
          <Box id="view-container">

            <RootViewModel state={pageState} />
          </Box>
      </Box>
    </>
  );
}
