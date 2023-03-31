import { useCallback, useRef } from "react";
import { RootViewModel } from "./root.viewModel";
import { watchViewModel } from "react-model-view-viewmodel";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import { Box, Container, ThemeProvider } from "@mui/material";
import customTheme from "src/theme";
import SideBar from "src/components/SideBar/SideBar";
import { Helmet } from "react-helmet";
import { ChatProvider } from "../pages/Chat/components/ChatContext";
import TopBar from "src/components/TopBar/TopBar";

/**
 * Rendering entrypoint
 * @returns - View model with dynamic content
 */
export function RootView() {
  /** View Model state setup */
  const { current: viewModel } = useRef(new RootViewModel());
  const changeState = useCallback(() => viewModel.load(), [viewModel]);
  watchViewModel(viewModel);

  /** Theme setup */
  const theme = customTheme();

  return (
    <>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <ChatProvider>
            <Helmet>
              <title>King Pong | need to set this dynamically</title>
            </Helmet>
            {/* Outer wrapper for content*/}
            <Container>
              {/* Outer box for handling vertical flex with topbar */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <TopBar />
              {/* Inner box for horizontal flex with sidebar */}
                <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1}}>
                <SideBar changeState={changeState} />
                <viewModel.SelectDynamicContent />
                </Box>
              </Box>
            </Container>
          </ChatProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </>
  );
}
