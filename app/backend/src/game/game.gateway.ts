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
import { GameStartEntity } from "./entities/game.entity";

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
   * Gateway for a client sent game invite
   * @param {JoinGameInviteDto} joinGameInviteDto
   * @returns {}
   * @listens sendGameInvite
   */
  @SubscribeMessage("sendGameInvite")
  async sendGameInvite(@MessageBody() joinGameInviteDto: JoinGameInviteDto) {
    this.gameService.sendGameInvite();
  }

  /**
   * Join matchmaking queue for new game
   * @param {JoinGameQueueDto} joinGameQueueDto
   * @returns {}
   * @listens joinGameQueue
   */
  @SubscribeMessage("joinGameQueue")
  async joinGameQueue(@MessageBody() joinGameQueueDto: JoinGameQueueDto) {
    this.gameService.joinGameQueue();
  }

  /**
   * Handle playerReady event and start game when both players ready
   * @todo This needs to identify which player the ready alert came from
   * @todo return GameStartEntity
   * @param {PlayerReadyDto} playerReadyDto
   * @returns {Promise<GameStartEntity>}
   * @listens playerReady
   */
  @SubscribeMessage("playerReady")
  async playerReady(
    @MessageBody() playerReadyDto: PlayerReadyDto
  ): Promise<GameStartEntity> {
    this.gameService.gameStart();
    return null;
  }
}

