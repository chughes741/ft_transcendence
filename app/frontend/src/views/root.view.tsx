import { useCallback, useRef } from "react";
import { RootViewModel } from "./root.viewModel";
import { watchViewModel } from "react-model-view-viewmodel";
import { socket, WebSocketProvider } from "src/contexts/WebSocketContext";
import { ThemeProvider } from "@mui/material";
import customTheme from "src/theme";
import SideBar from "src/components/SideBar";
import { Helmet } from "react-helmet";
import { ChatProvider } from "../pages/Chat/components/ChatContext";

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
            <SideBar changeState={changeState} />
            <viewModel.SelectDynamicContent />
          </ChatProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </>
  );
}
