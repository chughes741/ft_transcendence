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
import { ChatMemberRank, UserStatus } from "@prisma/client";
import { SendDirectMessageRequest } from "../chat/chat.types";
import { PrismaService } from "src/prisma/prisma.service";
import { SendGameInviteRequest, AcceptGameInviteRequest } from "./game.gateway";
import { UserConnectionsService } from "src/user-connections.service";
type PlayerPair = GameTypes.PlayerQueue[];
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
    private chatService: ChatService,
    private prismaService: PrismaService,
    private userConnectionsService: UserConnectionsService
  ) {}

  //Get local instance of websocket server
  @WebSocketServer()
  public server: Server;
  public socket: Socket;
  private gameState: GameTypes.GameData;

  async sendEventToAllUserSockets(username: string, event: string, data: any) {
    logger.debug(`Sending event ${event} to user ${username}`);
    const userSockets = this.userConnectionsService.getUserSockets(username);
    if (!userSockets) {
      logger.warn(`User ${username} has no sockets`);
      return;
    }
    userSockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  /****************************************************************************/
  /**                                     Lobby                              **/
  /****************************************************************************/

  /**
   * Emit event to tell client that lobby has been successfully created
   *
   * @method createLobby
   * @param {GameTypes.PlayerQueue[]} playerPair
   * @param {JoinGameQueueRequest} player
   * @returns {}
   */
  async createLobby(
    playerPair: GameTypes.PlayerQueue[],
    player: JoinGameQueueRequest
  ) {
    logger.debug("createLobby() called");

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
    this.gameModuleData.addLobby(newLobby);

    //Send lobby data to clients
    this.server.to(playerPair[0].socket_id).emit(GameEvents.LobbyCreated, {
      lobby_id: newLobby.lobby_id,
      opponent_username: newLobby.players[1],
      player_side: "left"
    });

    this.server.to(playerPair[1].socket_id).emit(GameEvents.LobbyCreated, {
      lobby_id: newLobby.lobby_id,
      opponent_username: newLobby.players[0],
      player_side: "right"
    });

    try {
      await this.prismaService.user.update({
        where: { username: playerPair[0].username },
        data: { status: UserStatus.AWAY }
      });
    } catch (err) {
      logger.error("Error updating user status: ", err);
    }

    try {
      await this.prismaService.user.update({
        where: { username: playerPair[1].username },
        data: { status: UserStatus.AWAY }
      });
    } catch (err) {
      logger.error("Error updating user status: ", err);
    }
  }

  /****************************************************************************/
  /**                                Queue & Invite                          **/
  /****************************************************************************/

  /**
   * Adds player to the game queue and tries to find a match
   *
   * @method joinGameQueue
   * @param {Socket} client
   * @param {JoinGameQueueRequest} player
   * @returns {Promise<boolean>}
   */
  async joinGameQueue(
    client: Socket,
    player: JoinGameQueueRequest
  ): Promise<boolean> {
    logger.debug("joinGameQueue() called");

    // Check if player is already in queue
    if (!this.gameModuleData.checkQueue(player.username)) {
      // Create new queue member & add to queue array
      const newPlayer: GameTypes.PlayerQueue = {
        username: player.username,
        join_time: 0 /** @todo should be player.join_time. type needs to be swapped to number in kingpong-lib */,
        // client_mmr: getClientMMR;
        socket_id: client.id
      };
      this.gameModuleData.addQueue(newPlayer);
    }

    // Attempt to retrieve a pair of players
    const playerPair: GameTypes.PlayerQueue[] =
      this.gameModuleData.getPairQueue();

    // If successful call createLobby()
    if (playerPair) {
      this.createLobby(playerPair, player);
    }

    return true;
  }

  /**
   * Removes player from the game queue
   *
   * @param player
   * @param {LeaveGameQueueRequest} player
   * @returns {Promise<void>}
   */
  async leaveGameQueue(player: LeaveGameQueueRequest): Promise<void> {
    logger.debug("leaveGameQueue() called");

    //Check if player is already in the queue
    if (!this.gameModuleData.checkQueue(player.username)) {
      this.gameModuleData.removeQueueUsername(player.username);
    }
  }

  /**
   * Creates a new game lobby with sender and invitee as players
   *
   * @param {JoinGameInviteRequest} payload
   * @returns {Promise<LobbyCreatedEvent>}
   */
  async sendGameInvite(
    client: Socket,
    payload: SendGameInviteRequest
  ): Promise<void> {
    logger.debug("sendGameInvite() called");

    //Check if invited player is already in a game
    if (this.gameModuleData.isPlayerAvailable(payload.invited_username)) {
    } else {

      this.sendEventToAllUserSockets(payload.invited_username, "sendGameInviteEvent", {
        inviter_username: payload.inviter_username,
        invited_username: payload.invited_username
      });
      //Create new playerPair and add to invite array
      const players: PlayerPair = [
        {
          username: payload.inviter_username,
          join_time: Date.now(),
          socket_id: client.id
        },
        {
          username: payload.invited_username,
          join_time: Date.now(),
          socket_id: null
        }
      ];
      this.gameModuleData.addInvitePair(players);
    }
  }

  /**
   *
   */
  async acceptGameInvite(
    client: Socket,
    payload: AcceptGameInviteRequest
  ): Promise<void> {
    logger.debug("acceptGameInvite() called");

    //If accept is true
    if (payload.isAccepted === true) {
      //Add invitee socket info to player pair
      const players: PlayerPair = this.gameModuleData.getInvitePair(
        payload.inviter_username
      );
      if (players) {
        players.at(1).socket_id = client.id;
        this.createLobby(players, {
          username: players.at(0).username,
          join_time: null
        });
      }
    }

    this.gameModuleData.removeInvitePair(payload.inviter_username);
    //Remove players from invite array
  }

  /****************************************************************************/
  /**                                     Game                               **/
  /****************************************************************************/

  /**
   * Handle player readiness
   *
   * @param {PlayerReadyRequest} payload
   * @returns {Promise<boolean>}
   */
  async playerReady(payload: PlayerReadyRequest): Promise<boolean> {
    logger.debug("playerReady() called");

    logger.debug("lobby_id: " + this.gameModuleData.getLobby(payload.lobby_id));
    if (this.gameModuleData.getLobby(payload.lobby_id)) {
      this.gameModuleData.updatePlayerReady(payload);
      this.gameStart(payload.lobby_id);
    }
    return true;
  }

  /**
   * Start the game if both players are ready
   *
   * @param {string} lobby_id
   * @returns {Promise<void>}
   */
  async gameStart(lobby_id: string): Promise<void> {
    logger.debug("gameStart() called");

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
   * @returns {Promise<void>}
   */
  async clientUpdate(payload: ClientGameStateUpdateRequest): Promise<void> {
    //Find the correct match using match_id and update paddle pos
    this.gameModuleData.setPaddlePosition(payload);
  }
}
