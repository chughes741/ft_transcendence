import { createContext, useContext } from "react";
import { GameViewModelType } from "./game.viewModel";

export const GameContext = createContext<GameViewModelType | null>(null);

export const useGameContext = (): GameViewModelType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameContext.Provider");
  }
  return context;
};
