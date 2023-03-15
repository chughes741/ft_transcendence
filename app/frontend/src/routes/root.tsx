import { Outlet, useLoaderData } from "react-router-dom";
import { io } from "socket.io-client";
import { WebsocketProvider } from "src/contexts/WebsocketContext";

export async function rootLoader() {
  const data = await { message: "hello" };
  return data;
}

export default function Root() {
  const posts = useLoaderData();

  return (
    <>
      <WebsocketProvider value={io("http://localhost:3000")}>
        <Outlet />
      </WebsocketProvider>
    </>
  );
}
