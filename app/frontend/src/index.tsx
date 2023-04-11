import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/** Providers */
import { socket, WebSocketProvider } from "src/contexts/WebSocket.context";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { PageStateProvider } from "./contexts/PageState.context";
import { ChatViewModelProvider } from "src/chat/chat.viewModel";
import { ProfileViewModelProvider } from "./profile/profile.viewModel";

import customTheme from "src/theme";
import { RootView } from "./root.view";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "./components/error/error";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();


root.render(
  <ErrorBoundary FallbackComponent={Fallback}>
    <React.StrictMode>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <PageStateProvider>
            <ChatViewModelProvider>
              <ProfileViewModelProvider>
                <CssBaseline />
                <RootView />
              </ProfileViewModelProvider>
            </ChatViewModelProvider>
          </PageStateProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
