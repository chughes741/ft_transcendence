import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const socket = io("http://localhost:3000");

export type EventHandler = (...args: unknown[]) => void;

export interface WebSocketContextValue {
  socket: Socket;
  addSocketListener: (eventName: string, handler: EventHandler) => void;
  removeSocketListener: (eventName: string, handler?: EventHandler) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebSocketContext = createContext<WebSocketContextValue>(null as any);

interface WebSocketProviderProps {
  children: React.ReactNode;
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

  const value: WebSocketContextValue = {
    socket,
    addSocketListener,
    removeSocketListener
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

const useWebSocketContext = () => useContext(WebSocketContext);

export { socket, WebSocketContext, WebSocketProvider, useWebSocketContext };
