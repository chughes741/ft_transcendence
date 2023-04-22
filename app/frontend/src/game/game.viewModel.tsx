import React, { useEffect, createContext, useContext } from "react";
import { GameModelType, useGameModel } from "./game.model";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocket.context";
import {
  GameEndedEvent,
  GameEvents,
  GameStartedEvent,
  LobbyCreatedEvent,
  ServerGameStateUpdateEvent,
  GameState
} from "kingpong-lib";
import { useRootViewModelContext } from "src/root.context";

export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: () => Promise<void>;
  joinGameQueue: () => Promise<void>;
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
    scoreLeft,
    setScoreLeft,
    scoreRight,
    setScoreRight,
    gameState,
    setGameState
  } = gameModel;

  const { self } = useRootViewModelContext();

  /*******************/
  /*  Socket Calls   */
  /*******************/

  /**
   * @event "lobbyCreated"
   * @dependency displayQueue
   */
  useEffect(() => {
    if (!displayQueue) return;

    socket.on(GameEvents.LobbyCreated, (payload: LobbyCreatedEvent) => {
      console.log("lobbyCreated event received");

      setLobby(new GameTypes.Lobby());
      setLobbyId(payload.lobby_id);
      setPlayerSide(payload.player_side);
      setOpponentUsername(payload.opponent_username);

      setInQueue(false);
      setDisplayQueue(false);
      setDisplayLobby(true);
    });

    return () => {
      socket.off(GameEvents.LobbyCreated);
    };
  }, [displayQueue]);

  /**
   * @event "gameStarted"
   * @dependency playerReady
   */
  useEffect(() => {
    if (!playerReady) return;

    socket.on(GameEvents.GameStarted, (payload: GameStartedEvent) => {
      console.log("gameStarted event received. Payload:");
      console.log(payload);

      setPlayerSide(payload.player_side);
      setDisplayGame(true);
    });

    return () => {
      socket.off(GameEvents.LobbyCreated);
    };
  }, [playerReady]);

  /**
   * @event "gameEnded"
   * @dependency displayGame
   */
  useEffect(() => {
    if (!displayGame) return;

    socket.on(GameEvents.GameEnded, (payload: GameEndedEvent) => {
      console.log("gameEnded event received. Payload:");
      console.log(payload);

      setDisplayGame(false);
      setDisplayLobby(true);
    });

    return () => {
      socket.off(GameEvents.GameEnded);
    };
  }, [displayGame]);

  /**
   * Manage ready toggle
   *
   * @async
   */
  const setPlayerReadyState = async () => {
    if (playerReady) return;
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
  };

  /**
   * Manage joining the queue
   *
   * @async
   */
  const joinGameQueue = async () => {
    console.log("Joining queue");

    socket.emit(
      GameEvents.JoinGameQueue,
      {
        username: self.username,
        join_time: Date.now()
      },
      () => {
        setInQueue(true);
      }
    );
  };

  return (
    <GameViewModelContext.Provider
      value={{
        ...gameModel,
        setPlayerReadyState,
        joinGameQueue

        //...
      }}
    >
      {children}
    </GameViewModelContext.Provider>
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
