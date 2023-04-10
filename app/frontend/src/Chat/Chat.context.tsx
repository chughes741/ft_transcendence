import { createContext, useContext } from "react";
import { ChatViewModelType } from "./Chat.viewModel";

export const ChatContext = createContext<ChatViewModelType | null>(null);

export const useChatContext = (): ChatViewModelType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatContext.Provider");
  }
  return context;
};
