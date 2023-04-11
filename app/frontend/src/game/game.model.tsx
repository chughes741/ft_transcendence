import { useState } from "react";

export interface GameModelType {
  lobbyId: string;
  setLobbyId: (lobbyId: string) => void;
  playerReady: boolean;
  setPlayerReady: (lobbyId: boolean) => void;
}

export const useGameModel = (): GameModelType => {
  const [lobbyId, setLobbyId] = useState<string>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  
  return {
    lobbyId,
    setLobbyId,
    playerReady,
    setPlayerReady
  };
};
