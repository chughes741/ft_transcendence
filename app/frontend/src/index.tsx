import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/** Providers */
import { WebSocketProvider } from "src/contexts/WebSocket.context";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ChatViewModelProvider } from "src/chat/chat.viewModel";
import { ProfileViewModelProvider } from "./profile/profile.viewModel";
import { RootViewModelProvider } from "./root.viewModel";
import { SettingsViewModelProvider } from "./components/settings/settings.viewModel";
import { RoomManagerProvider } from "./chat/lib/roomManager";

import customTheme from "src/theme";
import { RootView } from "./root.view";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "./components/error/error";
import { GameViewModelProvider } from "./game/game.viewModel";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();

root.render(
  <ErrorBoundary FallbackComponent={Fallback}>
    <React.StrictMode>
      <WebSocketProvider>
        <ThemeProvider theme={theme}>
          <RootViewModelProvider>
            <RoomManagerProvider>
              <ChatViewModelProvider>
                <ProfileViewModelProvider>
                  <SettingsViewModelProvider>
                    <GameViewModelProvider>
                      <CssBaseline />
                      <RootView />
                    </GameViewModelProvider>
                  </SettingsViewModelProvider>
                </ProfileViewModelProvider>
              </ChatViewModelProvider>
            </RoomManagerProvider>
          </RootViewModelProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
