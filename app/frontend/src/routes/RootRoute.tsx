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

  return (
    <>
      <WebSocketProvider value={socket}>
        <ProSidebarProvider>
          <Outlet context={context} />
        </ProSidebarProvider>
      </WebSocketProvider>
    </>
  );
}
