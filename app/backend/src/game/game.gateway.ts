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
  JoinGameInviteDto,
  JoinGameQueueDto,
} from "./dto/game.dto";
import { GameStartEntity } from "./entities/game.entity";
import { ClientUpdateEvent } from "kingpong-lib";
import { ClientGameStateUpdate } from "./game.types";
import { GameModuleData } from "./game.data";

import * as GameTypes from "./game.types";
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
  async joinGameQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinGameQueueDto: JoinGameQueueDto
  ) {
    logger.log("Socket id: " + client.id);
    this.gameService.joinGameQueue(client, joinGameQueueDto);
  }

  /**
   * Handle playerReady event and start game when both players ready
   * @param {PlayerReadyDto} playerReadyDto
   * @returns {Promise<GameStartEntity>}
   * @listens playerReady
   *
   * @todo This needs to identify which player the ready alert came from
   * @todo return GameStartEntity
   */
  @SubscribeMessage("playerReady")
  async playerReady(@MessageBody() payload: GameTypes.PlayerReadyDto) {

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
   */
  @SubscribeMessage("clientGameStateUpdate")
  async clientUpdate(@MessageBody() payload: ClientGameStateUpdate) {
    this.gameService.clientUpdate(payload);
    return true;
  }
}
