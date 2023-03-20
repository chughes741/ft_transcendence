import { Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
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

  //Get local instance of websocker server
  @WebSocketServer()
  public server: Server;
  //To be removed and replaced with map below
  private gameState: GameData;

  //Create a map of currently running games
  private games = new Map<string, GameData>;


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

    //Generate a lobbyID

    //Create a new game instance (intialized to default values)
    this.games.set('lobbyID', this.gameLogic.initNewGame());

    //Create a new chat instance

    //Return data to client with 'joinLobby' event

    //Need to send response to all clients that are participating
    //Need to send a 'joinRoom' event to tell clients to join the room


    //This will make a single socket join specified room
    // this.server.in(socketID).socketsJoin('lobbyID');
  }

  /**
   *
   */
  async gameStart() {
    //If both players are ready, then start game
    if (this.gameState.player_left_ready && this.gameState.player_right_ready)
      this.startNewGame();

    //Emit gameStart event to clients so they can render the game window
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
