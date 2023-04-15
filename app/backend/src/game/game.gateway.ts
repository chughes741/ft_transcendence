import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

import {
  LeaveGameQueueRequest,
  JoinGameQueueRequest,
  GameEvents,
  PlayerReadyRequest,
  ClientGameStateUpdateRequest
} from "kingpong-lib";
import { GameService } from "./game.service";
import { GameModuleData } from "./game.data";

/** Create logger for module */
const logger = new Logger("gameGateway");

/**
 * Websocket gateway for game module
 */
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class GameGateway {
  constructor(
    private readonly gameService: GameService,
    private gameModuleData: GameModuleData
  ) {}

  // Load the server socket locally
  @WebSocketServer()
  server: Server;

  /**
   * Gateway for a client sent game invite
   * @param {JoinGameInviteDto} joinGameInviteDto
   * @returns {Promise<void>}
   * @listens sendGameInvite
   */
  // @SubscribeMessage("sendGameInvite")
  // async sendGameInvite(@MessageBody()) {
  //   this.gameService.sendGameInvite();
  // }

  /**
   * Join matchmaking queue for new game
   *
   * @param {Socket} client
   * @param {JoinGameQueueRequest} payload
   * @returns {Promise<void>}
   * @listens joinGameQueue
   */
  @SubscribeMessage(GameEvents.JoinGameQueue)
  async joinGameQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinGameQueueRequest
  ) {
    this.gameService.joinGameQueue(client, payload);
  }

  /**
   * Leave matchmaking queue
   *
   * @param {Socket} client
   * @param {LeaveGameQueueRequest} payload
   * @returns {Promise<void>}
   * @listens leaveGameQueue
   */
  @SubscribeMessage(GameEvents.LeaveGameQueue)
  async leaveGameQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveGameQueueRequest
  ) {
    this.gameService.leaveGameQueue(client, payload);
  }

  /**
   * Handle playerReady event and start game when both players ready
   *
   * @param {PlayerReadyRequest} payload
   * @returns {Promise<void>}
   * @listens playerReady
   *
   * @todo This needs to identify which player the ready alert came from
   * @todo return GameStartEntity
   */
  @SubscribeMessage(GameEvents.PlayerReady)
  async playerReady(@MessageBody() payload: PlayerReadyRequest) {
    //Retrieve the client id of the user who is ready
    console.log("Payload in playerReady");
    console.log(payload.lobby_id);
    console.log(payload);
    //Update ready status of players
    this.gameModuleData.updatePlayerReady(payload);
    //Attempt to start game
    this.gameService.gameStart(payload.lobby_id);
  }

  /**
   * Handle paddle position updates from players
   *
   * @param {GameTypes.ClientGameStateUpdateRequest} payload
   * @returns {Promise<void>}
   * @listens clientGameStateUpdate
   */
  @SubscribeMessage(GameEvents.ClientGameStateUpdate)
  async clientUpdate(@MessageBody() payload: ClientGameStateUpdateRequest) {
    this.gameService.clientUpdate(payload);
    return true;
  }
}
