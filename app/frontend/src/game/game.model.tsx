import { useState } from "react";

export enum DisplayState {
  default,
  queued,
  lobby,
  game
}


export interface GameModelType {
  lobbyId: string;
  setLobbyId: (lobbyId: string) => void;

  playerSide: string;
  setPlayerSide: (playerSide: string) => void;

  playerReady: boolean;
  setPlayerReady: (isReady: boolean) => void;

  displayState: DisplayState;
  setDisplayState: (displayState: DisplayState) => void;

  matchId: string;
  setMatchId: (matchId: string) => void;
}

export const useGameModel = (): GameModelType => {
  //Store lobby id to pass to server
  const [lobbyId, setLobbyId] = useState<string>(null);

  //Store if the player controls the left or right paddle
  const [playerSide, setPlayerSide] = useState<string>(null);

  //Toggle state of ready button
  const [playerReady, setPlayerReady] = useState<boolean>(false);

  //Control what components to render
  const [displayState, setDisplayState] = useState<DisplayState>(DisplayState.default);
  
  const [matchId, setMatchId] = useState<string>(null);
  
  return {
    lobbyId,
    setLobbyId,
    playerSide,
    setPlayerSide,
    playerReady,
    setPlayerReady,
    displayState,
    setDisplayState,
    matchId,
    setMatchId
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