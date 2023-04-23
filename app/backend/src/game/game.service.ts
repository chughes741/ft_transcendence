import { Logger, Injectable } from "@nestjs/common";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import * as GameTypes from "./game.types";
import {
  JoinGameQueueRequest,
  LeaveGameQueueRequest,
  PlayerReadyRequest,
  ClientGameStateUpdateRequest,
  JoinGameInviteRequest,
  LobbyCreatedEvent,
  GameEvents
} from "kingpong-lib";
import { ChatService } from "../chat/chat.service";
import { SendDirectMessageRequest } from "../chat/chat.gateway";
import { ChatMemberRank } from "@prisma/client";

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
    private gameModuleData: GameModuleData,
    private chatService: ChatService
  ) {}

  //Get local instance of websocket server
  @WebSocketServer()
  public server: Server;
  private gameState: GameTypes.GameData;

  /****************************************************************************/
  /**                                     Lobby                              **/
  /****************************************************************************/

  /**
   * Emit event to tell client that lobby has been successfully created
   *
   * @method createLobby
   * @param {GameTypes.PlayerQueue[]} playerPair
   * @returns {}
   * @async
   */
  async createLobby(
    playerPair: GameTypes.PlayerQueue[],
    player: JoinGameQueueRequest
  ) {
    logger.log("createLobby() called");

    // Create a chat room for the lobby
    const roomReq: SendDirectMessageRequest = {
      sender: playerPair[0].username,
      recipient: playerPair[1].username,
      senderRank: ChatMemberRank.USER
    };
    const chatRoom = await this.chatService.sendDirectMessage(roomReq);

    if (chatRoom instanceof Error) {
      logger.error("Error creating chat room: ", chatRoom);
      // TODO: put both players back in the queue?
      return;
    }

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
    this.gameModuleData.addLobby(newLobby);
    // GameModuleData.lobbies.push(newLobby);
    console.log("Sizeof lobbies: ", GameModuleData.lobbies.length);
    console.log(GameModuleData.lobbies[0]);

    //Create payload
    const payload: LobbyCreatedEvent = {
      lobby_id: newLobby.lobby_id,
      opponent_username:
        newLobby.players[0] === player.username
          ? newLobby.players[1]
          : newLobby.players[0],
      player_side: newLobby.players[0] === player.username ? "left" : "right"
    };

    //Emit lobbyCreated event to room members
    this.server.to(newLobby.lobby_id).emit(GameEvents.LobbyCreated, payload);
  }

  /****************************************************************************/
  /**                                Queue & Invite                          **/
  /****************************************************************************/

  /**
   * Adds player to the game queue and tries to find a match
   *
   * @method joinGameQueue
   * @param {JoinGameQueueRequest} player
   * @returns {Promise<boolean>}
   * @async
   */
  async joinGameQueue(
    client: Socket,
    player: JoinGameQueueRequest
  ): Promise<boolean> {
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

    return true;
  }

  /**
   * Removes player from the game queue
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
   *
   * @method sendGameInvite
   * @returns {Promise<LobbyCreatedEvent>}
   * @async
   */
  async sendGameInvite(
    payload: JoinGameInviteRequest
  ): Promise<LobbyCreatedEvent> {
    logger.log("joinGameInvite() called");

    //If the invited client responds then create lobby
    /** @todo  */
    return new LobbyCreatedEvent();
  }

  /****************************************************************************/
  /**                                     Game                               **/
  /****************************************************************************/

  /**
   * Handle player readiness
   * @param {PlayerReadyRequest} payload
   * @returns {Promise<boolean>}
   */
  async playerReady(payload: PlayerReadyRequest): Promise<boolean> {
    logger.log("playerReady() called");

    logger.log("lobby_id: " + this.gameModuleData.getLobby(payload.lobby_id));
    if (this.gameModuleData.getLobby(payload.lobby_id)) {
      this.gameModuleData.updatePlayerReady(payload);
      this.gameStart(payload.lobby_id);
    }
    return true;
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

    // Retrieve the correct lobby
    const lobby: GameTypes.gameLobby = this.gameModuleData.getLobby(lobby_id);
    if (!lobby) return;
    // Check if both players are ready
    if (lobby.gamestate.players_ready === 2) {
      this.gameLogic.gameStart(lobby);
    }
  }

  /**
   * Handle game state updates from the client to update paddle positions
   *
   * @method clientUpdate
   * @param {ClientGameStateUpdateRequest} payload
   * @returns {}
   * @async
   */
  async clientUpdate(payload: ClientGameStateUpdateRequest) {
    //Find the correct match using match_id and update paddle pos
    this.gameModuleData.setPaddlePosition(payload);
  }
}
