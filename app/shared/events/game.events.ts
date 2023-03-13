import { Ball, Paddle } from "../game.objects";

/**
 * Event names
 *
 * @example emit(gameEvents.createLobby, createLobbyEvent)
 */
export enum GameEvents {
  createLobby = "createLobby",
  joinLobby = "joinLobby",
  invitePlayer = "invitePlayer",
  clientReady = "clientReady",
  gameStart = "gameStart",
  gameEnd = "gameEnd",
  clientUpdate = "clientUpdate",
  serverUpdate = "serverUpdate",
}

/**
 *
 */
abstract class gameEvent {
  lobby_id: string;
}

/**
 * Client sent event
 */
export class CreateLobbyEvent extends gameEvent {}

/**
 *
 */
export class JoinLobbyEvent extends gameEvent {
  participant_type: string;
}

/**
 *
 */
export class JoinLobbyReply extends gameEvent {
  participant_type: string;
}

/**
 *
 */
export class InvitePlayerEvent extends gameEvent {
  participant_type: string;
}

/**
 *
 */
export class ClientReadyEvent extends gameEvent {}

/**
 *
 */
export class GameStartEvent extends gameEvent {}

/**
 *
 */
export class GameEndEvent extends gameEvent {}

/**
 *
 */
export class ClientUpdateEvent extends gameEvent {
  paddle_movement: number;
}

/**
 *
 */
export class ServerUpdateEvent {
  participant_type: string;
  ball: Ball;
  paddle_left: Paddle;
  paddle_right: Paddle;
  score: {
    player: number;
    opponent: number;
  };
}
