import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameService } from "./game.service";
import { Logger } from "@nestjs/common";
import {
  ClientGameStateUpdateRequest,
  JoinGameInviteRequest,
  LeaveGameQueueRequest,
  LobbyCreatedEvent,
  PlayerReadyRequest
} from "kingpong-lib";
import { GameModuleData } from "./game.data";
import { JoinGameQueueRequest, GameEvents } from "kingpong-lib";

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

  /****************************************************************************/
  /**                              Queue & Invite                            **/
  /****************************************************************************/

  /**
   * Handle direct game invite event
   * @param {JoinGameInviteDto} joinGameInviteDto
   * @returns {Promise<LobbyCreatedEvent>}
   * @listens sendGameInvite
   */
  @SubscribeMessage(GameEvents.SendGameInvite)
  async sendGameInvite(
    @MessageBody() payload: JoinGameInviteRequest
  ): Promise<LobbyCreatedEvent> {
    return this.gameService.sendGameInvite(payload);
  }

  /**
   * Handle the join queue event
   * @param {JoinGameQueueRequest} payload
   * @param {Socket} client
   * @returns {Promise<boolean>}
   * @listens GameEvents.JoinGameQueue
   */
  @SubscribeMessage(GameEvents.JoinGameQueue)
  async joinGameQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinGameQueueRequest
  ): Promise<boolean> {
    return this.gameService.joinGameQueue(client, payload);
  }

  /**
   * Handle the leave queue event
   * @param {Socket} client
   * @param {LeaveGameQueueRequest} payload
   * @listens GameEvents.LeaveGameQueue
   */
  @SubscribeMessage(GameEvents.LeaveGameQueue)
  async leaveGameQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveGameQueueRequest
  ) {
    this.gameService.leaveGameQueue(payload);
  }

  /****************************************************************************/
  /**                                    Game                                **/
  /****************************************************************************/

  /**
   * Handle playerReady event and start game when both players ready
   * @param {PlayerReadyRequest} payload
   * @returns {Promise<boolean>}
   * @listens GameEvents.PlayerReady
   */
  @SubscribeMessage(GameEvents.PlayerReady)
  async playerReady(
    @MessageBody() payload: PlayerReadyRequest
  ): Promise<boolean> {
    return this.gameService.playerReady(payload);
  }

  /**
   * Handle game state updates from clients
   * @param {ClientGameStateUpdateRequest} payload
   * @listens GameEvents.ClientGameStateUpdate
   */
  @SubscribeMessage(GameEvents.ClientGameStateUpdate)
  async clientUpdate(@MessageBody() payload: ClientGameStateUpdateRequest) {
    this.gameService.clientUpdate(payload);
    return true;
  }
}
