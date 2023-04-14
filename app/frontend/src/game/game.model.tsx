import { useState } from "react";
import { Lobby } from "./game.types";

export interface GameModelType {

  lobby: Lobby;
  setLobby: (lobby: Lobby) => void;

  lobbyId: string;
  setLobbyId: (lobbyId: string) => void;

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
}

export const useGameModel = (): GameModelType => {
  //Store lobby id to pass to server
  const [lobbyId, setLobbyId] = useState<string>(null);

  //Store if the player controls the left or right paddle
  const [playerSide, setPlayerSide] = useState<string>(null);

  //Toggle state of ready button
  const [playerReady, setPlayerReady] = useState<boolean>(false);

  const [displayQueue, setDisplayQueue] = useState<boolean>(false);
  const [displayLobby, setDisplayLobby] = useState<boolean>(false);
  const [displayReady, setDisplayReady] = useState<boolean>(false);
  const [displayGame, setDisplayGame] = useState<boolean>(false);
  const [displayScore, setDisplayScore] = useState<boolean>(false);
  const [lobby, setLobby] = useState<Lobby>(null);

  return {
    lobbyId,
    setLobbyId,
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
    setLobby
  };
};

/* Data to be stored client side:

- lobby_id
- player_side

*/

/* Components to be displayed:

default:
  - Find a Match button (joinQueue)
  - Some filler graphic or background

queued:
- mui waiting component
- leave queue button

lobby:
- chat component
- empty game component
- player details
- ready buttons

game:
- chat component
- game component
- player details
- score component

*/
