import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RootView } from "./views/root.view";

import { ChatViewModelProvider } from "src/pages/chat/ChatViewModel";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import customTheme from "src/theme";
import { PageStateProvider } from "./contexts/PageStateContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();

root.render(
  <>
    <React.StrictMode>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <PageStateProvider>
            <ChatViewModelProvider>
              <CssBaseline />
              <RootView />
            </ChatViewModelProvider>
          </PageStateProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </React.StrictMode>
  </>
);
