import React, { useEffect, createContext, useContext } from "react";
import { GameModelType, useGameModel } from "./game.model";
import { GameContext } from "./game.context";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocket.context";
import { GameEvents, GameStartedEvent, LobbyCreatedEvent } from "kingpong-lib";
import { useRootViewModelContext } from "src/root.context";

export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: (state: boolean) => Promise<boolean>;
}

export const GameViewModelContext: React.Context<GameViewModelType | null> =
  createContext<GameViewModelType | undefined>(null);

export const GameViewModelProvider = ({ children }) => {
  const gameModel = useGameModel();

  const {
    lobby,
    setLobby,
    lobbyId,
    matchId,
    setMatchId,
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
    scoreLeft,
    setScoreLeft,
    scoreRight,
    setScoreRight
  } = gameModel;

  const { self } = useRootViewModelContext();

  /*******************/
  /*  Socket Calls   */
  /*******************/

  /**
   * @event "gameStarted"
   * @dependency playerReady
   */
  useEffect(() => {
    socket.on(GameEvents.GameStarted, (payload: GameStartedEvent) => {
      setPlayerSide(payload.game_state.player_side);
      setDisplayGame(true);
    });

    return () => {
      socket.off(GameEvents.LobbyCreated);
    };
  }, [playerReady]);

  /**
   * @event "lobbyCreated"
   * @dependency displayQueue
   */
  useEffect(() => {
    socket.on(GameEvents.LobbyCreated, (payload: LobbyCreatedEvent) => {
      console.log("lobbyCreated event received. Payload:");
      console.log(payload);

      setLobby(new GameTypes.Lobby(payload.lobby_id, payload.player_side));

      setDisplayQueue(false);
      setDisplayLobby(true);
    });

    return () => {
      socket.off(GameEvents.LobbyCreated);
    };
  }, [displayQueue]);

  /**
   * Manage ready toggle
   *
   * @param state
   * @returns
   */
  const setPlayerReadyState = async (state: boolean) => {
    socket.emit(
      GameEvents.PlayerReady,
      {
        match_id: matchId,
        lobby_id: lobbyId,
        username: self.username,
        ready: true
      },
      (response: boolean) => {
        setPlayerReady(response);
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
