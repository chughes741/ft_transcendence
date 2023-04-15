import { Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameConfig, PaddleConfig, BallConfig } from "./config/game.config";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import * as vec2 from "gl-vec2";
import { GameData, BallData, gameLobby } from "./game.types";
import { degToRad } from "./game.utils";
import {
  ServerGameStateUpdateEvent,
  GameEvents,
  GameState
} from "kingpong-lib";
const logger = new Logger("gameLogic");

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class GameLogic {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @WebSocketServer()
  public server: Server;

  /*************************************************************************************/
  /**                                   Game Setup                                    **/
  /*************************************************************************************/

  //Initialize new game
  initNewGame(players: string[]): GameData {
    const gameData: GameData = new GameData();

    //Setup general game properties
    gameData.is_new_round = true;
    gameData.bounds.width = GameConfig.playAreaWidth;
    gameData.bounds.height = GameConfig.playAreaHeight;
    gameData.players_ready = 0;
    gameData.players = [];
    gameData.players[0] = players[0];
    gameData.players[1] = players[1];

    //Randomize serve side for initial serve
    if (Math.round(Math.random()) === 0) gameData.last_serve_side = "left";
    else gameData.last_serve_side = "right";

    //Setup initial paddle state
    gameData.paddle_left.pos.y = 0;
    gameData.paddle_left.pos.x = -(
      GameConfig.playAreaWidth / 2 -
      PaddleConfig.borderOffset
    );
    gameData.paddle_right.pos.y = 0;
    gameData.paddle_right.pos.x =
      GameConfig.playAreaWidth / 2 - PaddleConfig.borderOffset;

    return gameData;
  }

  //Create a new game instance
  async gameStart(lobby: gameLobby) {
    //Add new interval to scheduler

    try {
      this.schedulerRegistry.getInterval("gameUpdateInterval" + lobby.lobby_id);
      logger.log("Error creating gameUpdateInterval");
    } catch {
      this.addGameUpdateInterval(
        lobby,
        "gameUpdateInterval" + lobby.lobby_id,
        GameConfig.serverUpdateRate
      );
    }
   
  }

  /*************************************************************************************/
  /**                                 Gameplay Logic                                  **/
  /*************************************************************************************/

  //Calculate game state and send server update
  async sendServerUpdate(lobby: gameLobby) {
    lobby.gamestate = this.calculateGameState(lobby.gamestate);

    //Build payload
    const gamestate: GameState = {
      ball_x: lobby.gamestate.ball.pos.x,
      ball_y: lobby.gamestate.ball.pos.y,
      paddle_left_y: lobby.gamestate.paddle_left.pos.y,
      paddle_right_y: lobby.gamestate.paddle_right.pos.y,
      score_left: lobby.gamestate.score[0],
      score_right: lobby.gamestate.score[1]
    };

    //Send update to lobby websocket room
    this.server
      .to(lobby.lobby_id)
      .emit(GameEvents.ServerGameStateUpdate, { gamestate });
  }

  //Calculate game state and return gamestate object
  calculateGameState(gameData: GameData): GameData {
    //Check if new round
    if (gameData.is_new_round) {
      gameData.last_update_time = Date.now();
      gameData.ball = this.getRandomBallDirection(gameData);
      gameData.is_new_round = false;
    }
    //If not new round, calculate ball position and update timestamp
    else {
      gameData.ball = this.updateBall(gameData);
      gameData.last_update_time = Date.now();
    }
    return gameData;
  }

  //Calculate ball position
  updateBall(gameData: GameData): BallData {
    //Save previous ball data
    const prev: BallData = gameData.ball;
    const cur: BallData = new BallData();

    //Current ball position is previous ball position + (direction * speed)
    const time_diff: number = (Date.now() - gameData.last_update_time) / 1000;

    [cur.pos.x, cur.pos.y] = vec2.scaleAndAdd(
      [cur.pos.x, cur.pos.y],
      [prev.pos.x, prev.pos.y],
      [prev.direction.x, prev.direction.y],
      prev.speed * time_diff
    );
    cur.direction = prev.direction;
    cur.speed = prev.speed;

    //Check for collision with each wall
    //hacky temporary solve
    if (cur.pos.x >= GameConfig.playAreaWidth / 2 - 0.1) {
      cur.direction.x = -cur.direction.x;
    } else if (cur.pos.x <= -(GameConfig.playAreaWidth / 2) + 0.1) {
      cur.direction.x = -cur.direction.x;
    } else if (cur.pos.y >= GameConfig.playAreaHeight / 2 - 0.1) {
      cur.direction.y = -cur.direction.y;
    } else if (cur.pos.y <= -(GameConfig.playAreaHeight / 2) + 0.1) {
      cur.direction.y = -cur.direction.y;
    }

    return cur;
  }

  //Get a new random ball direction and velocity
  getRandomBallDirection(gameData: GameData): BallData {
    const ballData: BallData = new BallData();
    ballData.pos.x = 0;
    ballData.pos.y = 0;
    ballData.speed = BallConfig.initialSpeed;

    //Angle needs to be centered on x axis, so need to get offset from y-axis (half the remainder when angle is subracted from 180)
    const angle_offset = (180 - BallConfig.maxServeAngle) / 2;

    //Get a random value in angle range and add the offset
    const angle =
      Math.round(Math.round(Math.random() * BallConfig.maxServeAngle)) +
      angle_offset;

    //Convert the angle to a vector
    [ballData.direction.x, ballData.direction.y] = vec2.set(
      [ballData.direction.x, ballData.direction.y],
      Math.sin(degToRad(angle)),
      Math.cos(degToRad(angle))
    );

    //Normalize the vector
    [ballData.direction.x, ballData.direction.y] = vec2.normalize(
      [ballData.direction.x, ballData.direction.y],
      [ballData.direction.x, ballData.direction.y]
    );

    //If last serve was to the right, invert x value to send left
    if (gameData.last_serve_side === "right") {
      ballData.direction.x = -ballData.direction.x;
      gameData.last_serve_side = "left";
    } else gameData.last_serve_side = "right";

    return ballData;
  }

  /*************************************************************************************/
  /**                           Interval Management                                   **/
  /*************************************************************************************/

  //Add new gameUpdateInterval
  async addGameUpdateInterval(
    lobby: gameLobby,
    name: string,
    milliseconds: number
  ) {
    //Set callback function to gamestate
    const interval = setInterval(
      this.sendServerUpdate.bind(this),
      milliseconds
    );
    this.schedulerRegistry.addInterval(name, interval);
    logger.log(`Interval ${name} created`);
  }

  //Delete an interval
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    logger.log(`Interval ${name} deleted!`);
  }
}
