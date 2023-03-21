import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const socket = io("http://localhost:3000"); // The socketClient port

const WebSocketContext = createContext<Socket>(socket);

const WebSocketProvider = WebSocketContext.Provider;

export { socket, WebSocketContext, WebSocketProvider };
