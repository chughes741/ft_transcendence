import * as GameTypes from "./game.types";

/**
 * Storage class for handling runtime volatile service data
 */
export class GameModuleData {
  public static queue = new Map<string, GameTypes.PlayerQueue>();
  public static games = new Map<number, GameTypes.GameData>();
  public static lobbies = new Map<string, GameTypes.gameLobby>();
  /**
   * Adds player to game queue
   * @method addQueue
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  addQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue.set(player.client_id, player);
  }

  /**
   * Removes player from game queue
   * @method removeQueue
   * @param {GameTypes.PlayerQueue} player
   * @returns {}
   */
  removeQueue(player: GameTypes.PlayerQueue) {
    GameModuleData.queue.delete(player.client_id);
  }

  /**
   * What does this do
   * @method  getPairQueue
   * @returns {GameTypes.PlayerQueue[]}
   *
   * @todo Fix current match systems and implement actual MMR checks
   */
  getPairQueue(): GameTypes.PlayerQueue[] {
    if (GameModuleData.queue.size >= 2) {
      const playerPair: GameTypes.PlayerQueue[] = [
        GameModuleData.queue[0],
        GameModuleData.queue[1]
      ];
      this.removeQueue(GameModuleData.queue[0]);
      this.removeQueue(GameModuleData.queue[1]);
      return playerPair;
    } else {
      return null;
    }
  }
}
