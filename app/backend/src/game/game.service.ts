import { Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import * as GameTypes from "./game.types";
import * as GameDto from "./dto/game.dto";
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
const logger = new Logger("gameService");

/**
 * GameService class
 */
@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class GameService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private gameLogic: GameLogic,
    private gameModuleData: GameModuleData
  ) {}

  //Get local instance of websocker server
  @WebSocketServer()
  public server: Server;
  private gameState: GameTypes.GameData;

  /**
   * Creates a new game lobby with sender and invitee as players
   * @method sendGameInvite
   * @returns {}
   * @async
   * 
   * @todo add timeout for response
   * @todo pass both players data to createLobby
   */
  async sendGameInvite() {
    logger.log("joinGameInvite() called");

    // this.createLobby();
  }

  /**
   * @method joinGameQueue
   * @param {Socket} client
   * @param {JoinGameQueueDto} player
   * @returns {}
   * @async
   * @todo function
   */
  async joinGameQueue(client: Socket, player: GameDto.JoinGameQueueDto) {
    logger.log("joinGameQueue() called");

    //Create a player queue object
    const newPlayer: GameTypes.PlayerQueue = new GameTypes.PlayerQueue;

    //Populate data for player
    newPlayer.client_id = player.client_id;
    newPlayer.join_time = player.join_time;
    // queuedPlayer.client_mmr = getClientMMR();

    //Add player to queue
    this.gameModuleData.addQueue(newPlayer);

    //Emit that player has joined the queue (so a timer can be displayed client side)
    client.emit('joinedGameQueue');

    //Attempt to retrieve a pair of players
    const playerPair: GameTypes.PlayerQueue[] = this.gameModuleData.getPairQueue();
    //If successful call createLobby()
    if (playerPair) {
      this.createLobby(playerPair);
    }
  }

  /**
   * Emit event to tell client that lobby has been successfully created
   * @method createLobby
   * @param {GameTypes.PlayerQueue[]} playerPair
   * @returns {}
   * @async
   * 
   * @todo function
   */
  async createLobby(playerPair: GameTypes.PlayerQueue[]) {
    logger.log("createLobby() called");

    //Create a new lobby
    const newLobby = new GameTypes.gameLobby;

    //Populate lobby data
    newLobby.players.push(playerPair[0]);
    newLobby.players.push(playerPair[1]);
    newLobby.created_at = Date.now();
    // newLobby.lobby_id = 

    //Create a new websocket room
    this.server.socketsJoin();

    //Subscribe players to the websocket room

    //Emit lobbyCreated event to room members
  }

  /**
   * Start the game if both players are ready
   * @method gameStart
   * @returns {}
   * @async
   */
  async gameStart() {
    logger.log("gameStart() called");

    if (this.gameState.player_left_ready && this.gameState.player_right_ready)
      this.startNewGame();

    //Emit gameStart event to clients so they can render the game window
  }

  /**
   * Creates a new game instance
   * @method startNewGame
   * @returns {}
   * @async
   */
  async startNewGame() {
    logger.log("startNewGame() called");

    try {
      this.schedulerRegistry.getInterval("gameUpdateInterval");
    } catch {
      logger.log("Error creating gameUpdateInterval");
      this.gameLogic.createGame(this.gameState);
    }
  }
}
