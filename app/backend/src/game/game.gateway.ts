import { ConfigModule } from "@nestjs/config";
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from 'socket.io';
import { GameService } from "./game.service";

import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from "@nestjs/common";

// import {
  // ClientReadyEvent,
  // ClientUpdateEvent,
  // CreateLobbyEvent,
  // GameEvents,
  // InvitePlayerEvent,
  // JoinLobbyEvent,
// } from "../../../shared/events/game.events";



//Create logger for module
const logger = new Logger('gameLog');


//Setup websocket gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class GameGateway {
  constructor(private readonly gameService: GameService, private schedulerRegistry: SchedulerRegistry) {}

  //Load the server socket locally
  @WebSocketServer()
  server: Server;
  

  //Setup bew game on 'gameStart' event
  @SubscribeMessage('gameStart')
  async newGame() {
    logger.log('gameStart event received');
    this.gameService.createGame();
  }

  //Delete interval on 'gameEnd' event
  @SubscribeMessage('gameEnd')
  async endGame() {
    this.gameService.deleteInterval('gameUpdateInterval');
  }



  /**
   *
   * @param CreateLobbyEvent
   */
  // @SubscribeMessage(GameEvents.createLobby)
  // async createLobby(@MessageBody() createLobbyEvent: CreateLobbyEvent) {
    // return this.gameService.createLobby(createLobbyEvent);
  // }

  /**
   *
   * @param JoinLobbyEvent
   */
  // @SubscribeMessage(GameEvents.joinLobby)
  // async joinLobby(@MessageBody() joinLobbyEvent: JoinLobbyEvent) {
    // return this.gameService.joinLobby(joinLobbyEvent);
  // }

  /**
   *
   * @param InvitePlayerEvent
   */
  // @SubscribeMessage(GameEvents.invitePlayer)
  // async invitePlayer(@MessageBody() invitePlayerEvent: InvitePlayerEvent) {
    // return this.gameService.invitePlayer(invitePlayerEvent);
  // }

  /**
   *
   * @param ClientReadyEvent
   */
  // @SubscribeMessage(GameEvents.clientReady)
  // async clientReady(@MessageBody() clientReadyEvent: ClientReadyEvent) {
    // return this.gameService.clientReady(clientReadyEvent);
  // }

  /**
   * 
   * @param ClientUpdateEvent 
   */
  // @SubscribeMessage(GameEvents.clientUpdate)
  // async clientUpdate(@MessageBody() clientUpdateEvent: ClientUpdateEvent) {
    // return this.gameService.clientUpdate(clientUpdateEvent);
  // }
}
 