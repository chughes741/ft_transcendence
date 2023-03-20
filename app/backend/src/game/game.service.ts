import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { degToRad } from "./game.utilis";
import { GameData } from "./game.types";
import { GameLogic } from "./game.logic";
const logger = new Logger("gameService");

//Setup websocket gateway
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class GameService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameLogic: GameLogic
  ) {}

  @WebSocketServer()
  public server: Server;
  private gameState: GameData;

  /**
   *
   */
  async joinGameQueue() {
    // Wait for queue
    // Calls createLobby
  }

  /**
   *
   */
  async joinGameInvite() {
    // Wait for invite to be accepted
    // Calls createLobby
  }

  /**
   * Emit event to tell client that lobby has been successfully created
   */
  async createLobby() {
    //Create a new game instance
    //Create a new chat instance
    //Return data to client with 'joinLobby' event
  }

  /**
   *
   */
  async gameStart() {
    //If both players are ready, then start game
    if (this.gameState.player_left_ready && this.gameState.player_right_ready)
      this.startNewGame();
  }

  /**
   *
   */
  async startNewGame() {
    logger.log("Creating a new game instance");

    try {
      this.schedulerRegistry.getInterval("gameUpdateInterval");
    } catch {
      logger.log("Error creating gameUpdateInterval");
      this.gameLogic.createGame(this.gameState);
    }
  }
}
