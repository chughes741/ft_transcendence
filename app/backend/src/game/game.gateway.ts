import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameService } from "./game.service";

import { Logger } from "@nestjs/common";
import {
  JoinGameInviteDto,
  JoinGameQueueDto,
  PlayerReadyDto
} from "./dto/game.dto";
import { GameStartEntity, JoinGameEntity } from "./entities/game.entity";

//Create logger for module
const logger = new Logger("gameGateway");

//Setup websocket gateway
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  // Load the server socket locally
  @WebSocketServer()
  server: Server;

  /**
   * Message to join an invite game
   * @todo need to return a JoinGameEntity
   * @param {JoinGameInviteDto} joinGameInviteDto
   * @returns {Promise<JoinGameEntity>}
   */
  @SubscribeMessage("joinGameInvite")
  async acceptGameInvite(
    @MessageBody() joinGameInviteDto: JoinGameInviteDto
  ): Promise<JoinGameEntity> {
    this.gameService.joinGameInvite();
    return null;
  }

  /**
   * Join queue for new game
   * @todo needs to return a JoinGameEntity
   * @param {JoinGameQueueDto} joinGameQueueDto
   * @returns {Promise<JoinGameEntity>}
   */
  @SubscribeMessage("joinGameQueue")
  async joinGameQueue(
    @MessageBody() joinGameQueueDto: JoinGameQueueDto
  ): Promise<JoinGameEntity> {
    this.gameService.joinGameQueue();
    return null;
  }

  /**
   * Handle playerReady event and start game when both players ready
   * @todo This needs to identify which player the ready alert came from
   * @param {PlayerReadyDto} playerReadyDto
   * @returns {Promise<GameStartEntity>}
   */
  @SubscribeMessage("playerReady")
  async playerReady(
    @MessageBody() playerReadyDto: PlayerReadyDto
  ): Promise<GameStartEntity> {
    this.gameService.gameStart();
    return null;
  }
}
