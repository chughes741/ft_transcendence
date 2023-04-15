import { Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { v4 as uuidv4 } from "uuid";

import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import * as GameTypes from "./game.types";
import {
  ClientGameStateUpdateRequest,
  JoinGameQueueRequest,
  LeaveGameQueueRequest
} from "kingpong-lib";

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

  //Get local instance of websocket server
  @WebSocketServer()
  public server: Server;
  private gameState: GameTypes.GameData;

  /**
   * Creates a new game lobby with sender and invitee as players
   *
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
   *
   * @param {Socket} client
   * @param {JoinGameQueueRequest} player
   * @returns {Promise<void>}
   */
  async joinGameQueue(client: Socket, player: JoinGameQueueRequest) {
    logger.log("joinGameQueue() called");

    //Populate data for player
    const newPlayer: GameTypes.PlayerQueue = {
      username: player.username,
      join_time: 0,
      // client_mmr: getClientMMR;
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
   *
   * @param player
   */
  async leaveGameQueue(player: LeaveGameQueueRequest) {
    logger.log("leaveGameQueue() called");

    //Check if player is in queue
  }

  /**
   * Emit event to tell client that lobby has been successfully created
   *
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
    newLobby.players.push(playerPair[0].username);
    newLobby.players.push(playerPair[1].username);
    newLobby.created_at = Date.now();
    newLobby.lobby_id = uuidv4();

    //Create a new websocket room and subscribe players
    this.server.in(playerPair[0].socket_id).socketsJoin(newLobby.lobby_id);
    this.server.in(playerPair[1].socket_id).socketsJoin(newLobby.lobby_id);

    //Add the game init here instead of elsewhere

    //Add lobby to map of lobbies
    //TODO: Swap this to a setter function in the data module
    GameModuleData.lobbies.push(newLobby);

    //Create payload
    const payload: GameTypes.LobbyCreatedDto = {
      lobby_id: newLobby.lobby_id,
      player_side: "left"
    };

    //Emit lobbyCreated event to room members
    this.server.to(newLobby.lobby_id).emit("lobbyCreated", payload);
  }

  /**
   * Start the game if both players are ready
   *
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
      try {
        this.schedulerRegistry.getInterval("gameUpdateInterval");
        logger.log("Error creating gameUpdateInterval");
      } catch {
        logger.log("Started game successfully");
        this.gameLogic.createGame(this.gameState);
      }
    }
  }

  /**
   * Update the game state from the client
   *
   * @method clientUpdate
   * @param {ClientGameStateUpdateRequest} payload
   */
  async clientUpdate(payload: ClientGameStateUpdateRequest) {
    //Find the correct match using match_id and update paddle pos
    this.gameModuleData.setPaddlePosition(payload);
  }
}
