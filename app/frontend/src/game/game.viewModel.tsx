import React, { useEffect, createContext, useContext } from "react";
import { GameModelType, useGameModel } from "./game.model";
import { GameContext } from "./game.context";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocket.context";

export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: (state: boolean) => Promise<boolean>;
}

export const GameViewModelContext: React.Context<GameViewModelType | null> =
  createContext<GameViewModelType | undefined>(null);

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

      setLobby(new GameTypes.Lobby(payload.lobby_id, payload.player_side));
      // Set the lobby display state to true
      gameModel.setDisplayLobby(true);
    });

    return () => {
      socket.off("lobbyCreated");
    };
  }, [displayQueue]);

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
        setPlayerReadyState

        //...
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

/**
 *  Returns the GameViewModelContext
 *
 * @returns {GameViewModelType}
 */
export const useGameViewModelContext = (): GameViewModelType => {
  const context = useContext(GameViewModelContext);
  if (context === undefined) {
    throw new Error(
      "useProfileViewModelContext must be used within a ProfileViewModelProvider"
    );
  }
  return context;
};
