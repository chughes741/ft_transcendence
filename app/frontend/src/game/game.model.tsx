import { useState } from "react";
import { Lobby } from "./game.types";

export interface GameModelType {
  lobby: Lobby;
  setLobby: (lobby: Lobby) => void;

  lobbyId: string;
  setLobbyId: (lobbyId: string) => void;

  matchId: string;
  setMatchId: (matchId: string) => void;

  playerSide: string;
  setPlayerSide: (playerSide: string) => void;

  playerReady: boolean;
  setPlayerReady: (isReady: boolean) => void;

  //Component display states
  displayQueue: boolean;
  setDisplayQueue: (displayQueue: boolean) => void;

  displayLobby: boolean;
  setDisplayLobby: (displayLobby: boolean) => void;

  displayReady: boolean;
  setDisplayReady: (displayReady: boolean) => void;

  displayGame: boolean;
  setDisplayGame: (displayGame: boolean) => void;

  displayScore: boolean;
  setDisplayScore: (displayScore: boolean) => void;

  scoreLeft: number;
  setScoreLeft: (scoreLeft: number) => void;

  scoreRight: number;
  setScoreRight: (scoreRight: number) => void;
}

export const useGameModel = (): GameModelType => {
  const [lobby, setLobby] = useState<Lobby>(null);
  const [lobbyId, setLobbyId] = useState<string>(null);
  const [matchId, setMatchId] = useState<string>(null);
  const [playerSide, setPlayerSide] = useState<string>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  
  //Display states
  const [displayQueue, setDisplayQueue] = useState<boolean>(true);
  const [displayLobby, setDisplayLobby] = useState<boolean>(false);
  const [displayReady, setDisplayReady] = useState<boolean>(false);
  const [displayGame, setDisplayGame] = useState<boolean>(false);
  const [displayScore, setDisplayScore] = useState<boolean>(false);

  const [scoreLeft, setScoreLeft] = useState<number>(0);
  const [scoreRight, setScoreRight] = useState<number>(0);
  
  return {
    lobbyId,
    setLobbyId,
    matchId,
    setMatchId,
    playerSide,
    setPlayerSide,
    playerReady,
    setPlayerReady,
    displayQueue,
    setDisplayQueue,
    displayLobby,
    setDisplayLobby,
    displayReady,
    setDisplayReady,
    displayGame,
    setDisplayGame,
    displayScore,
    setDisplayScore,
    lobby,
    setLobby,
    scoreLeft,
    setScoreLeft,
    scoreRight,
    setScoreRight
  };
};
