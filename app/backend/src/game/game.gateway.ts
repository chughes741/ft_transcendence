import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameService } from "./game.service";
import {
  ClientGameStateUpdateRequest,
  JoinGameInviteRequest,
  LeaveGameQueueRequest,
  LobbyCreatedEvent,
  PlayerReadyRequest,
  JoinGameQueueRequest,
  GameEvents
} from "kingpong-lib";
import { GameModuleData } from "./game.data";


export const AcceptGameInvite: string = "acceptGameInviteEvent";
export class AcceptGameInviteRequest {
  inviter_username: string;
  invited_username: string;
  isAccepted: boolean;
}

export const SendGameInvite: string = "sendGameInviteEvent";
export class SendGameInviteRequest {
  inviter_username: string;
  invited_username: string;
}






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
   */
  @SubscribeMessage(SendGameInvite)
  async sendGameInvite(
    @MessageBody() payload: SendGameInviteRequest,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.gameService.sendGameInvite(client, payload);
  }

  /**
   * Handle accept game invite event
   */
  @SubscribeMessage(AcceptGameInvite)
  async acceptGameInvite(
      @MessageBody() payload: AcceptGameInviteRequest,
      @ConnectedSocket() client: Socket,
  ) {
    this.gameService.acceptGameInvite(client, payload)
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
