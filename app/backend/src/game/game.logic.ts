import { Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameConfig, PaddleConfig, BallConfig } from "./config/game.config";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import * as vec2 from "gl-vec2";
import { GameData, BallData } from "./game.types";
import { degToRad } from "./game.utils";
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

  //Create a new game instance
  async createGame(gameState: GameData) {
    //Create new gameData object
    gameState = this.initNewGame();
    logger.log("New game object created");

    //Add new interval to scheduler
    this.addGameUpdateInterval(
      "gameUpdateInterval",
      GameConfig.serverUpdateRate
    );
  }

  //Calculate game state and send server update
  async sendServerUpdate(gameState: GameData) {
    gameState = this.calculateGameState(gameState);
    this.server.emit("serverUpdate", gameState);
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

  //Initialize new game
  initNewGame(): GameData {
    const gameData: GameData = new GameData();

    //Setup general game properties
    gameData.is_new_round = true;
    gameData.bounds.width = GameConfig.playAreaWidth;
    gameData.bounds.height = GameConfig.playAreaHeight;
    gameData.player_left_ready = false;
    gameData.player_right_ready = false;
    gameData.players_ready = 0;

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

  //Add new gameUpdateInterval
  async addGameUpdateInterval(name: string, milliseconds: number) {
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
