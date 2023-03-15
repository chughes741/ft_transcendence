import { Outlet, useLoaderData } from "react-router-dom";
import { WebsocketProvider } from "src/contexts/WebsocketContext";
import { socket } from "src/contexts/WebsocketContext";

export async function rootLoader() {
  const data ={ message: "hello" };
  return data;
}

export default function Root() {
  const posts = useLoaderData();
  const context = {name: "Allo"};

  return (
    <>
      <WebsocketProvider value={socket}>
        <Outlet context={context}/>
      </WebsocketProvider>
    </>
  );
}
