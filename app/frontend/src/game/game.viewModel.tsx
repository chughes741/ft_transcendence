import { GameModelType, useGameModel, DisplayState } from "./game.model";
import { GameContext } from "./game.context";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocketContext";
export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: (state: boolean) => Promise<boolean>;
  setLobbyState: (state: string) => Promise<string>;
  setGameState: (state: string) => Promise<string>;
}

export const GameViewModelProvider = ({ children }) => {
  const gameModel = useGameModel();

  const { playerReady, setPlayerReady } = gameModel;
  const { lobbyId, setLobbyId } = gameModel;
  const { displayState, setDisplayState } = gameModel;
  const { matchId, setMatchId } = gameModel;
  const { playerSide, setPlayerSide} = gameModel;

  /**
   * Manage state transition from queue to lobby
   * @param state
   */
  const setLobbyState = async (state: string) => {
    socket.on("lobbyCreated", (payload: GameTypes.LobbyCreatedDto) => {
      console.log(payload);

      //store the new lobby id as a state
      setLobbyId(payload.lobby_id);

      //Change view state to render lobby
      setDisplayState(DisplayState.lobby);
    });
  };

  /**
   * Manage state transition to game start
   * @param state 
   */
  const setGameState = async (state: string) => {
    socket.on("gameStarted", (payload: GameTypes.GameStartedDto) => {
      setMatchId(payload.match_id);
      setPlayerSide(payload.player_side);
      setDisplayState(DisplayState.game);
    });
  };

  /**
   * Manage ready toggle
   * @param state
   * @returns
   */
  const setPlayerReadyState = async (state: boolean) => {
    console.log("in toggle button:");
    console.log(lobbyId);
    const payload: GameTypes.PlayerReadyDto = new GameTypes.PlayerReadyDto(
      lobbyId,
      state
    );
    socket.emit(
      "playerReady",
      payload,
      (response: boolean | { error: string }) => {
        if (typeof response === "object") {
          alert(response.error);
        } else {
          setPlayerReady(true);
        }
      }
    );
    return true;
  };

  return (
    <GameContext.Provider
      value={{
        ...gameModel,
        setPlayerReadyState,
        setLobbyState,
        setGameState
        //...
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// lobbyId,
// setLobbyId,
// playerSide,
// setPlayerSide,
// playerReady,
// setPlayerReady,
// displayState,
// setDisplayState,

// export function GameViewModel(props) {
//   switch (displayState) {
//     case "queued": {
//       return <>;
//     }
//     case : {
//       return <>;
//     }
//     case 3: {
//       return <>;
//     }
//     default: {
//       return <>;
//     }
//   }
// }
