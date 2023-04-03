import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RootView } from "./views/root.view";

import { ChatViewModelProvider } from "src/pages/chat/ChatViewModel";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import customTheme from "src/theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
const theme = customTheme();

root.render(
  <>
    <React.StrictMode>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <ChatViewModelProvider>
            <CssBaseline />
            <RootView />
          </ChatViewModelProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </React.StrictMode>
  </>
);
