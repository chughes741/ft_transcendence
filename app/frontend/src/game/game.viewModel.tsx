import React, { useEffect } from "react";
import { GameModelType, useGameModel} from "./game.model";
import { GameContext } from "./game.context";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocketContext";

export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: (state: boolean) => Promise<boolean>;
}

export const GameViewModelProvider = ({ children }) => {
  const gameModel = useGameModel();

  const {
    playerReady,
    setPlayerReady,
    setPlayerSide,
    displayQueue,
    displayGame,
    setDisplayGame,
    lobby,
    setLobby
  } = gameModel;

  /*******************/
  /*  Socket Calls   */
  /*******************/

  /**
   * @event "gameStarted"
   * @dependency playerReady
   */
  useEffect(() => {
    socket.on("gameStarted", (payload: GameTypes.GameStartedDto) => {
      // TODO: implement rest of the lobby logic
      setPlayerSide(payload.player_side);
      setDisplayGame(true);
    });

    return () => {
      socket.off("gameStarted");
    };
  }, [playerReady]);

  /**
   * @event "lobbyCreated"
   * @dependency displayQueue
   */
  useEffect(() => {
    socket.on("lobbyCreated", (payload: GameTypes.LobbyCreatedDto) => {
      console.log("lobbyCreated event received. Payload:");
      console.log(payload);

      setLobby(new GameTypes.Lobby(payload.lobby_id, payload.player_side))
      // Set the lobby display state to true
      gameModel.setDisplayLobby(true);
      
    });

    return () => {
      socket.off("lobbyCreated");
    };
  }, [displayQueue]);


  // export class Lobby {
  //   constructor(Lobby_ID: string, Player_Side: string) {
  //     this.lobby_id = Lobby_ID;
  //     this.player_side = Player_Side;
  //   }
  //   player_side: string;
  //   lobby_id: string;
  
  //   game: {
  //     ball_x: number,
  //     ball_y: number,
  //     paddle_left_y: number;
  //     paddle_right_y: number;
  //     //pause state?
  //     score: number[];
  //   }
  // }

  /**
   * Manage ready toggle
   * @param state
   * @returns
   */
  const setPlayerReadyState = async (state: boolean) => {
    const payload: GameTypes.PlayerReadyDto = new GameTypes.PlayerReadyDto(
      lobby.lobby_id,
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

        //...
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

