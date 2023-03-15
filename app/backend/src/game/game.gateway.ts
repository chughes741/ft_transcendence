import { ConfigModule } from "@nestjs/config";
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from 'socket.io';
import { GameService } from "./game.service";

import { Interval, SchedulerRegistry } from '@nestjs/schedule';
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
  

  //Setup interval on 'gameStart' event
  @SubscribeMessage('gameStart')
  async initGameInterval() {
    //Call interval creation function
    this.addGameUpdateInterval('gameUpdateInterval', 50);
  }

  //Delete interval on 'gameEnd' event
  @SubscribeMessage('gameEnd')
  async endGame() {
    this.deleteInterval('gameUpdateInterval');
  }

  //Add new gameUpdateInterval
  async addGameUpdateInterval(name: string, milliseconds: number) {
    //Set callback function to gamestate
    const interval = setInterval(this.sendServerUpdate.bind(this), milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    logger.log(`Interval ${name} created!`);
  }

  //Delete an interval
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    logger.log(`Interval ${name} deleted!`);
  }

  //Calculate game state and send server update
  async sendServerUpdate() {
      this.server.emit('serverUpdate', {
        rot: this.gameService.calculateGameState()
      });
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
 