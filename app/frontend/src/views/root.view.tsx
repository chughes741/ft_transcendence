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
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <ChatViewModelProvider>
            <Helmet>
              <title>King Pong | {page_name[pageState]}</title>
            </Helmet>
            {/* Outer wrapper for content*/}
            <Container
              style={{
                margin: "0",
                padding: "0",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Top bar component */}
              <TopBar setPageState={setPageState} />

              {/* Inner box for horizontal flex with sidebar */}

              <SideBar setPageState={setPageState} />

              <RootViewModel state={pageState} />
            </Container>
          </ChatViewModelProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </>
  );
}
