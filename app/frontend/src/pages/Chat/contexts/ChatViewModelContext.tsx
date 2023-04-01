import React, { createContext, useContext } from "react";
import { ChatViewModelType } from "../ChatViewModel";

export const ChatViewModelContext = createContext<ChatViewModelType | null>(
  null
);

export const useChatViewModelContext = (): ChatViewModelType => {
  const context = useContext(ChatViewModelContext);
  if (!context) {
    throw new Error(
      "useChatViewModelContext must be used within ChatViewModelContext.Provider"
    );
  }
  return context;
};
