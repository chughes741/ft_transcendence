import * as GameTypes from "./game.types";
import { Logger } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { PlayerReadyRequest, ClientGameStateUpdateRequest } from "kingpong-lib";
import { PrismaService } from "src/prisma/prisma.service";
const logger = new Logger("gameData");

export type PlayerPair = GameTypes.PlayerQueue[];

/**
 * Storage class for handling runtime volatile service data
 */
export class GameModuleData {
  public static queue: GameTypes.PlayerQueue[] = [];
  public static games: GameTypes.GameData[] = [];
  public static lobbies: GameTypes.gameLobby[] = [];
  public static invite: PlayerPair[] = [];
  public static prismaService: PrismaService;

  /****************************************************************************/
  /**                                Queue                                   **/
  /****************************************************************************/

  /**
   * Check if a given user is already in the queue
   *
   * @param {string} username
   * @returns {GameTypes.PlayerQueue}
   */
  checkQueue(username: string): GameTypes.PlayerQueue {
    GameModuleData.queue.forEach((element) => {
      if (element.username === username) {
        return element;
      }
    });
    return null;
  }

  /**
   * Adds player to game queue
   *
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  addQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue.push(player);
    logger.debug("size of queue: " + GameModuleData.queue.length);
  }

  /**
   * Removes player from queue given a player object
   *
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  removeQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue = GameModuleData.queue.filter(
      (element) => element !== player
    );
  }

  /**
   * Removes a player from queue given a username
   *
   * @param {string} player
   * @returns {}
   */
  removeQueueUsername(player: string) {
    logger.debug("size of queue before: " + GameModuleData.queue.length);

    GameModuleData.queue = GameModuleData.queue.filter(
      (element) => element.username !== player
    );

    logger.debug("size of queue after: " + GameModuleData.queue.length);
  }

  /**
   * Attempts to return a pair of players from the queue
   *
   * @returns {GameTypes.PlayerQueue[]}
   */
  getPairQueue(): GameTypes.PlayerQueue[] {
    if (GameModuleData.queue.length >= 2) {
      const playerPair: GameTypes.PlayerQueue[] = [];
      playerPair.push(GameModuleData.queue.pop());
      playerPair.push(GameModuleData.queue.pop());
      return playerPair;
    } else {
      return null;
    }
  }

  /*****************************************************************************/
  /**                               Gameplay                                  **/
  /*****************************************************************************/

  /**
   * Sets the position of the paddle for a given player in a given lobby
   *
   * @param {ClientGameStateUpdateRequest} payload
   * @returns {}
   */
  setPaddlePosition(payload: ClientGameStateUpdateRequest) {
    //Find correct match
    GameModuleData.lobbies.forEach((element) => {
      //If match_id is found then update paddle pos
      if (element.lobby_id === payload.lobby_id) {
        if (payload.username === element.players[0]) {
          element.gamestate.paddle_left.pos.y = payload.paddle_position;
        } else {
          element.gamestate.paddle_right.pos.y = payload.paddle_position;
        }
      }
    });
  }

  /**
   * Update the player ready status for a player in specified lobby
   *
   * @param {PlayerReadyRequest} payload
   * @returns {}
   */
  updatePlayerReady(payload: PlayerReadyRequest) {
    GameModuleData.lobbies.forEach((element) => {
      if (element.lobby_id === payload.lobby_id) {
        if (payload.ready) {
          element.gamestate.players_ready++;
        } else {
          element.gamestate.players_ready--;
        }
        logger.debug("PlayersReady: " + element.gamestate.players_ready);
      }
    });
  }

  /**
   * Retrieve the lobby object that corresponds to the given lobby id
   *
   * @param {string} lobby_id
   * @returns {GameTypes.gameLobby | null}
   */
  getLobby(lobby_id: string): GameTypes.gameLobby | null {
    for (let i = 0; i < GameModuleData.lobbies.length; i++) {
      const element = GameModuleData.lobbies[i];
      // If lobby_id is found, return the element
      if (element.lobby_id === lobby_id) {
        return element;
      }
    }
    return null;
  }

  /**
   * Adds a lobby to the list of lobbies
   *
   * @param {GameTypes.gameLobby} lobby
   * @returns {boolean}
   */
  addLobby(lobby: GameTypes.gameLobby): boolean {
    if (GameModuleData.lobbies.push(lobby)) {
      return true;
    }
    return false;
  }

  /**
   * Check if a player is currently in a game
   */
  async isPlayerAvailable(username: string): Promise<boolean> {
    try {
      const user = await GameModuleData.prismaService.user.findUnique({
        where: {
          username
        },
        select: {
          status: true
        }
      });
      return user.status === UserStatus.ONLINE;
    } catch (err) {
      console.error("Prisma err in isPlayerAvailable");
    }
  }

  /**
   * Remove a lobby and match from memory
   */
  removeLobby(lobby_id: string) {
    GameModuleData.lobbies.forEach((element) => {
      if (element.lobby_id === lobby_id) {
        const match_id = element.match_id;
        GameModuleData.games = GameModuleData.games.filter(
          (element) => element.match_id != match_id
        );
        GameModuleData.lobbies = GameModuleData.lobbies.filter(
          (element) => element.lobby_id != lobby_id
        );
      }
    });
  }

  /*****************************************************************************/
  /**                               Invites                                  **/
  /*****************************************************************************/

  /**
   * Add a pair of players to invite list
   */
  addInvitePair(pair: GameTypes.PlayerQueue[]) {
    GameModuleData.invite.push(pair);
  }

  /**
   * Remove a pair of players from invite list
   */
  removeInvitePair(username: string) {
    GameModuleData.invite = GameModuleData.invite.filter(
      (element) =>
        element.at(0).username != username && element.at(1).username != username
    );
  }

  /**
   *
   */
  getInvitePair(username: string): PlayerPair {
    GameModuleData.invite.forEach((element) => {
      if (
        element.at(0).username === username ||
        element.at(1).username === username
      ) {
        return element;
      }
    });
    return null;
  }
}
