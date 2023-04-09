import { Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import * as GameTypes from "./game.types";
import * as GameDto from "./dto/game.dto";
import { v4 as uuidv4 } from "uuid";

const logger = new Logger("gameService");

export class PlayerQueue {
  client_id: string;
  join_time: number;
  client_mmr: number;
  socket_id: string; //Temporary
}

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

    //If the invited client responds then create lobby
  }

  /**
   * Adds player to the game queue and tries to find a match
   * @method joinGameQueue
   * @param {GameDto.JoinGameQueueDto} player
   * @returns {}
   * @async
   */
  async joinGameQueue(client: Socket, player: GameDto.JoinGameQueueDto) {
    logger.log("joinGameQueue() called");

    //Create a player queue object

    //Populate data for player
    const newPlayer: GameTypes.PlayerQueue = {
      // newPlayer.client_id = player.client_id; //TODO: Database integration
      client_id: uuidv4(), //TODO: Temporary
      join_time: player.join_time,
      client_mmr: 500,
      socket_id: client.id
    };
    //Add player to queue
    this.gameModuleData.addQueue(newPlayer);

    //Attempt to retrieve a pair of players
    const playerPair: GameTypes.PlayerQueue[] =
      this.gameModuleData.getPairQueue();
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
   */
  async createLobby(playerPair: GameTypes.PlayerQueue[]) {
    logger.log("createLobby() called");

    //Create a new lobby
    const newLobby = new GameTypes.gameLobby();
    newLobby.players = [];
    //Populate lobby data
    newLobby.players.push(playerPair[0].client_id);
    newLobby.players.push(playerPair[1].client_id);
    newLobby.created_at = Date.now();
    newLobby.lobby_id = uuidv4();

    //Create a new websocket room and subscribe players
    this.server.in(playerPair[0].socket_id).socketsJoin(newLobby.lobby_id);
    this.server.in(playerPair[1].socket_id).socketsJoin(newLobby.lobby_id);

    //Add lobby to map of lobbies
    //TODO: Swap this to a setter function in the data module
    GameModuleData.lobbies.push(newLobby);

    //Emit lobbyCreated event to room members

    this.server.to(newLobby.lobby_id).emit("lobbyCreated");
  }

  // export class LobbyCreatedPayload {

  // }

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

  /**
   *
   */
  async clientUpdate(payload: GameTypes.ClientGameStateUpdate) {
    //Find the correct match using match_id and update paddle pos
    this.gameModuleData.setPaddlePosition(payload);
  }
}
