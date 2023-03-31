import { useState } from "react";
import { Helmet } from "react-helmet";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import customTheme from "src/theme";
import { Box, Container, ThemeProvider } from "@mui/material";
import SideBar from "src/components/SideBar/SideBar";
import { ChatProvider } from "../pages/Chat/components/ChatContext";
import TopBar from "src/components/TopBar/TopBar";
import { RootViewModel } from "./root.viewModel";

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
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <Helmet>
            <title>King Pong | {page_name[pageState]}</title>
          </Helmet>
          <ChatProvider>
            {/* Outer wrapper for content*/}
            <Container>
              {/* Outer box for handling vertical flex with topbar */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <TopBar setPageState={setPageState} />
                {/* Inner box for horizontal flex with sidebar */}
                <Box
                  sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}
                >
                  <SideBar setPageState={setPageState} />
                  <RootViewModel state={pageState} />
                </Box>
              </Box>
            </Container>
          </ChatProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </>
  );
}