import * as GameTypes from "./game.types";
import { Logger } from "@nestjs/common";

const logger = new Logger("gameData");

/**
 * Storage class for handling runtime volatile service data
 */
export class GameModuleData {
  public static queue: GameTypes.PlayerQueue[] = [];
  public static games: GameTypes.GameData[] = [];
  public static lobbies: GameTypes.gameLobby[] = [];

  /**
   * Adds player to game queue
   * @method addQueue
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  addQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue.push(player);
  }

  /**
   * Removes player from game queue
   * @method removeQueue
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  removeQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue = GameModuleData.queue.splice(
      GameModuleData.queue.indexOf(player),
      1
    );
  }

  /**
   *
   * @method  getPairQueue
   * @returns {GameTypes.PlayerQueue[]}
   *
   * @todo Fix current match systems and implement actual MMR checks
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

  /**
   *
   */
  setPaddlePosition(payload: GameTypes.ClientGameStateUpdate) {
    //Find correct match
    GameModuleData.lobbies.forEach((element) => {
      //If match_id is found then update paddle pos
      if (element.match_id === payload.match_id) {
        if (payload.player_side === "left") {
          element.gamestate.paddle_left.pos.y = payload.paddle_pos;
        } else {
          element.gamestate.paddle_right.pos.y = payload.paddle_pos;
        }
      }
    });
  }


  /**
   * Update the player ready status for a player in specified lobby
   * @param {GameTypes.PlayerReadyDto} payload
   */
  updatePlayerReady(payload: GameTypes.PlayerReadyDto) {
    console.log("entered updatePlayerReady");
    console.log(payload.lobby_id);
    GameModuleData.lobbies.forEach((element) => {
      //If match_id is found then update paddle pos
      if (element.lobby_id === payload.lobby_id) {
        if (payload.is_ready) {
          element.gamestate.players_ready++;
        } else {
          element.gamestate.players_ready--;
        }
        console.log("PlayersReady: " + element.gamestate.players_ready);
      }
    });
  }


  /**
   * Retrieve the lobby object that corresponds to the given lobby id
   */
  getLobby(lobby_id: string): GameTypes.gameLobby {
    GameModuleData.lobbies.forEach((element) => {
      //If match_id is found then update paddle pos
      if (element.lobby_id === lobby_id) {
        return element;
      }
    });
    return null;
  }
}
