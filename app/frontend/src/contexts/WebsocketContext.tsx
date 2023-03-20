import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const socket = io("http://localhost:3000"); // The socketClient port

const WebsocketContext = createContext<Socket>(socket);

const WebsocketProvider = WebsocketContext.Provider;

export { socket, WebsocketContext, WebsocketProvider };
