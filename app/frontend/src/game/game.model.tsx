import { useState } from "react";
import { Lobby } from "./game.types";
import { GameState } from "kingpong-lib";

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

  opponentUsername: string;
  setOpponentUsername: (opponentUsername: string) => void;

  //Component display states
  displayQueue: boolean;
  setDisplayQueue: (displayQueue: boolean) => void;

  inQueue: boolean;
  setInQueue: (inQueue: boolean) => void;

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

  gameState: GameState;
  setGameState: (gameState: GameState) => void;

  inviter: string;
  setInviter: (inviter: string) => void;
}

export const useGameModel = (): GameModelType => {
  const [lobby, setLobby] = useState<Lobby>(null);
  const [lobbyId, setLobbyId] = useState<string>(null);
  const [matchId, setMatchId] = useState<string>(null);
  const [playerSide, setPlayerSide] = useState<string>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [opponentUsername, setOpponentUsername] = useState<string>(null);

  //Display states
  const [displayQueue, setDisplayQueue] = useState<boolean>(true);
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [displayLobby, setDisplayLobby] = useState<boolean>(false);
  const [displayReady, setDisplayReady] = useState<boolean>(false);
  const [displayGame, setDisplayGame] = useState<boolean>(false);
  const [displayScore, setDisplayScore] = useState<boolean>(false);
  const [scoreLeft, setScoreLeft] = useState<number>(0);
  const [scoreRight, setScoreRight] = useState<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    ball_x: 0,
    ball_y: 0,
    paddle_left_y: 0,
    paddle_right_y: 0,
    score_left: 0,
    score_right: 0
  });
  const [inviter, setInviter] = useState<string>(null);

  return {
    lobbyId,
    setLobbyId,
    matchId,
    setMatchId,
    playerSide,
    setPlayerSide,
    playerReady,
    setPlayerReady,
    opponentUsername,
    setOpponentUsername,
    displayQueue,
    setDisplayQueue,
    inQueue,
    setInQueue,
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
    setScoreRight,
    gameState,
    setGameState,
    inviter,
    setInviter
  };
};
