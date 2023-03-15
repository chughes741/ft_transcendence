import Views from "./components/Views";
import { io } from "socket.io-client";
import { WebsocketProvider } from "./contexts/WebsocketContext";

function App() {
  return (
    <WebsocketProvider value={io("http://localhost:3000")}>
      <Views />
    </WebsocketProvider>
  );
}

export default App;
