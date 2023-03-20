import { ConfigModule } from "@nestjs/config";
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameService } from "./game.service";

import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

//Create logger for module
const logger = new Logger("gameGateway");

//Setup websocket gateway
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class GameGateway {
  constructor(
    private readonly gameService: GameService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  // Load the server socket locally
  @WebSocketServer()
  server: Server;

  /**
   * Join queue for new game or accept an invite
   * Possible replies
   *  - Accept invite timeout
   *  - Lobby ID
   */
  @SubscribeMessage("joinGame")
  async joinGameInvite() {
    this.gameService.joinGameInvite();
  }

  /**
   * Join queue for new game or accept an invite
   * Possible replies
   *  - Match found / Lobby ID
   */
  @SubscribeMessage("joinGame")
  async joinGameQueue() {
    this.gameService.joinGameQueue();
  }

  /**
   * Message from client to accept a game invite
   */
  @SubscribeMessage("acceptGame")
  async acceptGame() {
    this.gameService.joinGameInvite();
  }

  /**
   * Handle playerReady event and start game when both players ready
   */
  @SubscribeMessage("playerReady")
  async playerReady() {
    //This needs to identify which player the ready alert came from
    this.gameService.gameStart();
  }
}
