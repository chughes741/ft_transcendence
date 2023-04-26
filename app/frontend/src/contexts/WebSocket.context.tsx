import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket = io("http://localhost:3000");

export type EventHandler = (...args: unknown[]) => void;

export interface WebSocketContextValue {
  socket: Socket;
  addSocketListener: (eventName: string, handler: EventHandler) => void;
  removeSocketListener: (eventName: string, handler?: EventHandler) => void;
}

//Interface for socket Headers
export interface SocketHeaders {
  clientId: string | null;
  clientToken: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebSocketContext = createContext<WebSocketContextValue>(null as any);

interface WebSocketProviderProps {
  children: React.ReactNode;
}


//Function to recreate socket with propers headers
export async function createSocketWithHeaders(headers: SocketHeaders) {
  await socket.disconnect();
  // Close the socket connection
  await socket.close();
  console.log("INSIDE CREATESOCKET WITH HEADERS");
  const extraHeaders = {};
  if (headers.clientId) {
    extraHeaders["client-id"] = headers.clientId;
  }
  if (headers.clientToken) {
    extraHeaders["client-token"] = headers.clientToken;
  }
  socket = await io("http://localhost:3000", {
    extraHeaders: {
      clientToken: headers.clientToken
    },
  });
}


const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const eventHandlers = useRef(new Map<string, EventHandler[]>());

  const addSocketListener = (eventName: string, handler: EventHandler) => {
    if (!eventHandlers.current.has(eventName)) {
      eventHandlers.current.set(eventName, []);
    }
    eventHandlers.current.get(eventName).push(handler);
    socket.on(eventName, handler);
  };

  const removeSocketListener = (eventName: string, handler?: EventHandler) => {
    if (eventHandlers.current.has(eventName)) {
      const handlers = eventHandlers.current.get(eventName);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        socket.off(eventName, handler);
      }
    }
  };
  const value: WebSocketContextValue = {
    socket,
    addSocketListener,
    removeSocketListener
  };
  /*
    async function createSocketWithHeaders(headers: SocketHeaders) {
      await value.socket.disconnect();
      console.log("INSIDE CREATESOCKET WITH HEADERS");
      const extraHeaders = {};
      if (headers.clientId) {
        extraHeaders["client-id"] = headers.clientId;
      }
      if (headers.clientToken) {
        extraHeaders["client-token"] = headers.clientToken;
      }
      value.socket = await io("http://localhost:3000", {
        extraHeaders,
      });
  }*/
  useEffect(() => {
    console.log("Inside WebsocketProvider UserEffect")


    if (socket) {
      value.socket = socket;
      value.socket.on("FirstConnect", () => {
        value.socket = socket;
      });
    }
  }, [socket]);


  useEffect(() => {
    return () => {
      // Clean up the listeners
      eventHandlers.current.forEach((handlers, eventName) => {
        handlers.forEach((handler) => {
          socket.off(eventName, handler);
        });
      });

      // Close the socket connection
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

const useWebSocketContext = () => useContext(WebSocketContext);

export { socket, WebSocketContext, WebSocketProvider, useWebSocketContext };
