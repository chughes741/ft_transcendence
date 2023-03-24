import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ProSidebarProvider } from "react-pro-sidebar";
import { Outlet, useLoaderData } from "react-router-dom";
import { WebSocketProvider } from "src/contexts/WebSocketContext";
import { socket } from "src/contexts/WebSocketContext";

export async function rootLoader() {
  const data = { message: "hello" };
  return data;
}

export default function RootRoute() {
  const posts = useLoaderData();
  const context = { name: "Allo" };
  const theme = createTheme();

  return (
    <>
      <WebSocketProvider value={socket}>
        <ThemeProvider theme={theme}>
          <ProSidebarProvider>
            <Outlet context={context} />
          </ProSidebarProvider>
        </ThemeProvider>
      </WebSocketProvider>
    </>
  );
}
