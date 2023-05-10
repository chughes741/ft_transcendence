import React, { useEffect, createContext, useContext } from "react";
import { GameModelType, useGameModel } from "./game.model";
import * as GameTypes from "src/game/game.types";
import { socket } from "src/contexts/WebSocket.context";
import {
  GameEndedEvent,
  GameEvents,
  GameStartedEvent,
  GameState,
  LobbyCreatedEvent
} from "kingpong-lib";
import { useRootViewModelContext } from "src/root.context";

export interface GameViewModelType extends GameModelType {
  setPlayerReadyState: () => Promise<void>;
  joinGameQueue: () => Promise<void>;
  setEventListeners: () => void;
}

export const GameViewModelContext: React.Context<GameViewModelType | null> =
  createContext<GameViewModelType | undefined>(null);

export const GameViewModelProvider = ({ children }) => {
  const gameModel = useGameModel();
  const {
    setLobby,
    lobbyId,
    matchId,
    setLobbyId,
    setPlayerSide,
    playerReady,
    setPlayerReady,
    setOpponentUsername,
    displayQueue,
    setDisplayQueue,
    setInQueue,
    setDisplayLobby,
    displayGame,
    setDisplayGame,
    setGameState,
    setScoreLeft,
    setScoreRight
  } = gameModel;

  const { self, setFullscreen } = useRootViewModelContext();

  //Functionnalities that can set event listeners to another socket.
  const setEventListeners = () => {
    socket.on(GameEvents.LobbyCreated, (payload: LobbyCreatedEvent) => {
      console.debug("lobbyCreated event received");

      setLobby(new GameTypes.Lobby());
      setLobbyId(payload.lobby_id);
      setPlayerSide(payload.player_side);
      setOpponentUsername(payload.opponent_username);
      setInQueue(false);
      setDisplayQueue(false);
      setDisplayLobby(true);
    });

    socket.on(GameEvents.GameStarted, (payload: GameStartedEvent) => {
      console.debug("gameStarted event received. Payload:", payload);
      setPlayerSide(payload.player_side);
      setDisplayGame(true);
    });

    // socket.on(GameEvents.GameEnded, (payload: GameEndedEvent) => {
    //   console.log("gameEnded event received");
    //   setGameState({
    //     ball_x: 0,
    //     ball_y: 0,
    //     paddle_left_y: 0,
    //     paddle_right_y: 0,
    //     score_left: 0,
    //     score_right: 0
    //   });
    //   setScoreLeft(0);
    //   setScoreRight(0);
    //   setOpponentUsername("");
    //   setDisplayGame(false);
    //   setDisplayLobby(false);
    //   setDisplayQueue(true);
    //   setFullscreen(false);
    //   setInQueue(false);
    //   setPlayerReady(false);
    //   setPlayerSide("");
    // });

    socket.on(GameEvents.ServerGameStateUpdate, (payload: GameState) => {
      setGameState(payload);
      setScoreLeft(payload.score_left);
      setScoreRight(payload.score_right);
    });

    return () => {
      socket.off(GameEvents.ServerGameStateUpdate);
      socket.off(GameEvents.LobbyCreated);
      socket.off(GameEvents.GameStarted);
      // socket.off(GameEvents.GameEnded);
    };
  };

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
      console.debug("lobbyCreated event received");

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
      console.debug("gameStarted event received. Payload:", payload);

      setPlayerSide(payload.player_side);
      setDisplayGame(true);
    });

    return () => {
      socket.off(GameEvents.GameStarted);
    };
  }, [playerReady]);

  /**
   * @event "gameEnded"
   * @dependency displayGame
   */
  // useEffect(() => {
  //   if (!displayGame) return;

    socket.on(GameEvents.GameEnded, (payload: GameEndedEvent) => {
      console.log("gameEnded event received 2");
      setGameState({
        ball_x: 0,
        ball_y: 0,
        paddle_left_y: 0,
        paddle_right_y: 0,
        score_left: 0,
        score_right: 0
      });
      setScoreLeft(0);
      setScoreRight(0);
      setOpponentUsername("");
      setDisplayGame(false);
      setDisplayLobby(false);
      setDisplayQueue(true);
      setFullscreen(false);
      setInQueue(false);
      setPlayerReady(false);
      setPlayerSide("");
    });

  //   return () => {
  //     socket.off(GameEvents.GameEnded);
  //   };
  // }, [displayGame]);

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
    console.debug("Joining queue");

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
        joinGameQueue,
        setEventListeners

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
