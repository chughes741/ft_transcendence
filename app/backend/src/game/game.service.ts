import { Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import * as GameTypes from "./game.types";
import { v4 as uuidv4 } from "uuid";
import {
  JoinGameQueueRequest,
  LeaveGameQueueRequest,
  PlayerReadyRequest,
  ClientGameStateUpdateRequest
} from "kingpong-lib";

const logger = new Logger("gameService");

export enum GameEvents {
  LobbyCreatedEvent = "lobbyCreatedEvent",
}


export class LobbyCreatedEvent {
  lobby_id: string;
  opponent_name: string;
  player_side: string;
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

  //Get local instance of websocket server
  @WebSocketServer()
  public server: Server;
  private gameState: GameTypes.GameData;

  /*************************************************************************************/
  /**                                  Lobby                                          **/
  /*************************************************************************************/

  /**
   * Emit event to tell client that lobby has been successfully created
   * @method createLobby
   * @param {GameTypes.PlayerQueue[]} playerPair
   * @returns {}
   * @async
   */
  async createLobby(playerPair: GameTypes.PlayerQueue[], player: JoinGameQueueRequest) {
    logger.log("createLobby() called");

    //Create a new lobby
    const newLobby = new GameTypes.gameLobby();
    newLobby.players = [];
    newLobby.players.push(playerPair[0].username);
    newLobby.players.push(playerPair[1].username);
    newLobby.created_at = Date.now();
    newLobby.lobby_id = uuidv4();

    //Create a new websocket room and subscribe players
    this.server.in(playerPair[0].socket_id).socketsJoin(newLobby.lobby_id);
    this.server.in(playerPair[1].socket_id).socketsJoin(newLobby.lobby_id);

    //Init new game object
    newLobby.gamestate = this.gameLogic.initNewGame(newLobby.players);

    //Add lobby to map of lobbies
    //TODO: Swap this to a setter function in the data module
    GameModuleData.lobbies.push(newLobby);

    //Create payload
    const payload: LobbyCreatedEvent = {
      lobby_id: newLobby.lobby_id,
      opponent_name: newLobby.players[0] === player.username ?  newLobby.players[1] : newLobby.players[0],
      player_side: newLobby.players[0] === player.username ?  "left" : "right",
    };

    //Emit lobbyCreated event to room members
    this.server.to(newLobby.lobby_id).emit(GameEvents.LobbyCreatedEvent, payload);
  }

  /*************************************************************************************/
  /**                              Queue & Invite                                     **/
  /*************************************************************************************/

  /**
   * Adds player to the game queue and tries to find a match
   * @method joinGameQueue
   * @param {JoinGameQueueRequest} player
   * @returns {}
   * @async
   */
  async joinGameQueue(client: Socket, player: JoinGameQueueRequest) {
    logger.log("joinGameQueue() called");

    //Check if player is already in queue
    if (!this.gameModuleData.checkQueue(player.username)) {
      //Create new queue member & add to queue array
      const newPlayer: GameTypes.PlayerQueue = {
        username: player.username,
        join_time: 0, //should be player.join_time. type needs to be swapped to number in kingpong-lib
        // client_mmr: getClientMMR;
        socket_id: client.id
      };
      this.gameModuleData.addQueue(newPlayer);
    }

    //Attempt to retrieve a pair of players
    const playerPair: GameTypes.PlayerQueue[] =
      this.gameModuleData.getPairQueue();

    //If successful call createLobby()
    if (playerPair) {
      this.createLobby(playerPair, player);
    }
  }

  /**
   *
   * @param player
   * @returns Return bool on success?
   */
  async leaveGameQueue(player: LeaveGameQueueRequest) {
    logger.log("leaveGameQueue() called");

    //Check if player is already in the queue
    if (!this.gameModuleData.checkQueue(player.username)) {
      this.gameModuleData.removeQueueUsername(player.username);
    }
  }

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

  /*************************************************************************************/
  /**                                   Game                                          **/
  /*************************************************************************************/

  /**
   * Handle player readiness
   * @param {PlayerReadyRequest} payload
   */
  async playerReady(payload: PlayerReadyRequest) {
    logger.log("playerReady() called");
    //If the lobby exists update ready and attempt to start game
    if (this.gameModuleData.getLobby(payload.lobby_id)) {
      this.gameModuleData.updatePlayerReady(payload);
      this.gameStart(payload.lobby_id);
    }
  }

  /**
   * Start the game if both players are ready
   * @method gameStart
   * @returns {}
   * @async
   */
  async gameStart(lobby_id: string) {
    logger.log("gameStart() called");

    //Retrieve the correct lobby
    const lobby: GameTypes.gameLobby = this.gameModuleData.getLobby(lobby_id);
    if (!lobby) return;
    //Check if both players are ready
    if (lobby.gamestate.players_ready === 2) {
      this.gameLogic.gameStart(lobby);
    }
  }

  /**
   * Handle game state updates from the client to update paddle positions
   */
  async clientUpdate(payload: ClientGameStateUpdateRequest) {
    //Find the correct match using match_id and update paddle pos
    this.gameModuleData.setPaddlePosition(payload);
  }
}
