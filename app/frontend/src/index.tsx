import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/** Providers */
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { PageStateProvider } from "./contexts/PageStateContext";
import { ChatViewModelProvider } from "src/pages/chat/ChatViewModel";
import { ProfileViewModelProvider } from "./views/profile/profile.viewModel";

import customTheme from "src/theme";
import { RootView } from "./views/root.view";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();

root.render(
  <>
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
  </>
);
