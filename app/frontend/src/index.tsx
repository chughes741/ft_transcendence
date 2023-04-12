import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/** Providers */
import { socket, WebSocketProvider } from "src/contexts/WebSocket.context";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ChatViewModelProvider } from "src/chat/chat.viewModel";
import { ProfileViewModelProvider } from "./profile/profile.viewModel";
import { RootViewModelProvider } from "./root.viewModel";

import customTheme from "src/theme";
import { RootView } from "./root.view";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "./components/error/error";
import GameLoader from "./game/components/GameLoader";
import { SettingsViewModelProvider } from "./components/settings/settings.viewModel";


const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();

root.render(
  <ErrorBoundary FallbackComponent={GameLoader}>
    <React.StrictMode>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <RootViewModelProvider>
            <ChatViewModelProvider>
              <ProfileViewModelProvider>
                <SettingsViewModelProvider>
                  <CssBaseline />
                  <RootView />
                </SettingsViewModelProvider>
              </ProfileViewModelProvider>
            </ChatViewModelProvider>
          </RootViewModelProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
