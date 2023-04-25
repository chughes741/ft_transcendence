import { Logger, Injectable } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { GameConfig, PaddleConfig, BallConfig } from "./config/game.config";
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Vec2 } from "./vector";
import { GameData, BallData, gameLobby, MatchType } from "./game.types";
import { degToRad, checkIntersect } from "./game.utils";
import { GameEvents, GameState } from "kingpong-lib";
import { GameType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const logger = new Logger("gameLogic");

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
@Injectable()
export class GameLogic {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private prismaService: PrismaService
  ) {}

  @WebSocketServer()
  public server: Server;

  /*************************************************************************************/
  /**                                   Game Setup                                    **/
  /*************************************************************************************/

  //Initialize new game
  initNewGame(players: string[]): GameData {
    const gamestate: GameData = new GameData();

    //Setup general game properties
    gamestate.is_new_round = true;
    gamestate.bounds.width = GameConfig.playAreaWidth;
    gamestate.bounds.height = GameConfig.playAreaHeight;
    gamestate.players_ready = 0;
    gamestate.players = [];
    gamestate.players[0] = players[0];
    gamestate.players[1] = players[1];
    gamestate.score = [0, 0];

    //Randomize serve side for initial serve
    if (Math.round(Math.random()) === 0) gamestate.last_serve_side = "left";
    else gamestate.last_serve_side = "right";

    //Setup initial paddle state
    gamestate.paddle_left.pos.y = 0;
    gamestate.paddle_left.pos.x = -(
      GameConfig.playAreaWidth / 2 -
      PaddleConfig.borderOffset
    );
    gamestate.paddle_right.pos.y = 0;
    gamestate.paddle_right.pos.x =
      GameConfig.playAreaWidth / 2 - PaddleConfig.borderOffset;

    return gamestate;
  }

  //Create a new game instance
  async gameStart(lobby: gameLobby) {
    //Add new interval to scheduler
    try {
      this.schedulerRegistry.getInterval("gameUpdateInterval" + lobby.lobby_id);
      logger.error("Error creating gameUpdateInterval");
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
  async sendServerUpdate(lobby: gameLobby): Promise<void> {
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

    if (
      lobby.gamestate.score[0] >= GameConfig.maxScore ||
      lobby.gamestate.score[1] >= GameConfig.maxScore
    ) {
      // Check if interval still exists
      try {
        this.deleteInterval("gameUpdateInterval" + lobby.lobby_id);
      } catch (error) {
        return;
      }

      const player1Id = await this.prismaService.getUserIdByNick(
        lobby.gamestate.players[0]
      );
      const player2Id = await this.prismaService.getUserIdByNick(
        lobby.gamestate.players[1]
      );
      this.server.to(lobby.lobby_id).emit(GameEvents.GameEnded, {
        match_id: lobby.lobby_id,
        lobby_id: lobby.lobby_id,
        game_state: gamestate
      });
      const match: MatchType = {
        player1Id,
        player2Id,
        scorePlayer1: lobby.gamestate.score[0],
        scorePlayer2: lobby.gamestate.score[1],
        timestamp: new Date(Date.now()),
        gameType: GameType.UNRANKED
      };
      logger.debug("Match: " + JSON.stringify(match));
      try {
        const ret = await this.prismaService.addMatch(match);
        logger.debug("Successfully added match to database");
      } catch (error) {
        logger.error("Problem with sendServerUpdate", error);
      }

      return;
    }

    //Send update to lobby websocket room
    this.server
      .to(lobby.lobby_id)
      .emit(GameEvents.ServerGameStateUpdate, gamestate);
  }

  //Calculate game state and return gamestate object
  calculateGameState(gamestate: GameData): GameData {
    //Check if new round
    if (gamestate.is_new_round) {
      gamestate.last_update_time = Date.now();
      gamestate.ball = this.getRandomBallDirection(gamestate);
      gamestate.is_new_round = false;
    }
    //If not new round, calculate ball position and update timestamp
    else {
      gamestate.ball = this.updateBall(gamestate);
      gamestate.last_update_time = Date.now();
    }
    return gamestate;
  }

  //Calculate ball position
  updateBall(gamestate: GameData): BallData {
    //Save previous ball data, and create an object for new ball data
    const prevBall: BallData = gamestate.ball;
    const curBall: BallData = new BallData();

    curBall.direction = prevBall.direction;
    curBall.speed = prevBall.speed;
    //Get a time difference between last update and this update
    const time_diff: number = (Date.now() - gamestate.last_update_time) / 1000;

    //Find new ball position
    curBall.pos = Vec2.scaleAndAdd(
      prevBall.pos,
      prevBall.direction,
      prevBall.speed * time_diff
    );

    //First need to check for paddle collision
    if (curBall.direction.x > 0) {
      //Check for collision with right side paddle
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        new Vec2(
          GameConfig.playAreaWidth / 2 - PaddleConfig.borderOffset,
          gamestate.paddle_right.pos.y + PaddleConfig.height / 2
        ),
        new Vec2(
          GameConfig.playAreaWidth / 2 - PaddleConfig.borderOffset,
          gamestate.paddle_right.pos.y - PaddleConfig.height / 2
        )
      );
      if (intersect) {
        const remainder: Vec2 = Vec2.sub(curBall.pos, intersect);
        curBall.pos = Vec2.add(intersect, remainder);
        curBall.direction.x = -curBall.direction.x;
        curBall.speed = curBall.speed * BallConfig.speedIncreaseInterval;
        return curBall;
      }
    } else if (curBall.direction.x < 0) {
      //Check for collisions with left side paddle
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        new Vec2(
          -(GameConfig.playAreaWidth / 2) + PaddleConfig.borderOffset,
          gamestate.paddle_left.pos.y + PaddleConfig.height / 2
        ),
        new Vec2(
          -(GameConfig.playAreaWidth / 2) + PaddleConfig.borderOffset,
          gamestate.paddle_left.pos.y - PaddleConfig.height / 2
        )
      );
      if (intersect) {
        const remainder: Vec2 = Vec2.sub(curBall.pos, intersect);
        curBall.pos = Vec2.add(intersect, remainder);
        curBall.direction.x = -curBall.direction.x;
        curBall.speed = curBall.speed * BallConfig.speedIncreaseInterval;
        return curBall;
      }
    }
    // Check if new ball position requires collision detection
    if (curBall.pos.x >= GameConfig.playAreaWidth / 2) {
      //Check collision between right wall and ball
      //First get intersection
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        GameConfig.topRight,
        GameConfig.botRight
      );

      // If Intersect reset game round and set a point for left player
      if (intersect) {
        gamestate.is_new_round = true;
        gamestate.score[0]++;
        return curBall;
      }
    } else if (curBall.pos.x <= -(GameConfig.playAreaWidth / 2)) {
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        GameConfig.topLeft,
        GameConfig.botLeft
      );
      // If Intersect reset game round and set a point for right player
      if (intersect) {
        gamestate.is_new_round = true;
        gamestate.score[1]++;
        return curBall;
      }
    } else if (curBall.pos.y >= GameConfig.playAreaHeight / 2) {
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        GameConfig.topLeft,
        GameConfig.topRight
      );
      if (intersect) {
        const remainder: Vec2 = Vec2.sub(curBall.pos, intersect);
        curBall.pos = Vec2.add(intersect, remainder);
        curBall.direction.y = -curBall.direction.y;
      }
    } else if (curBall.pos.y <= -(GameConfig.playAreaHeight / 2)) {
      const intersect: Vec2 = checkIntersect(
        prevBall.pos,
        curBall.pos,
        GameConfig.botLeft,
        GameConfig.botRight
      );
      if (intersect) {
        const remainder: Vec2 = Vec2.sub(curBall.pos, intersect);
        curBall.pos = Vec2.add(intersect, remainder);
        curBall.direction.y = -curBall.direction.y;
      }
    }

    //Janky simple collision
    // if (curBall.pos.x >= GameConfig.playAreaWidth / 2 - BallConfig.radius) {
    //   curBall.direction.x = -curBall.direction.x;
    // } else if (
    //   curBall.pos.x <= -(GameConfig.playAreaWidth / 2 + BallConfig.radius)
    // ) {
    //   curBall.direction.x = -curBall.direction.x;
    // } else if (
    //   curBall.pos.y >=
    //   GameConfig.playAreaHeight / 2 - BallConfig.radius
    // ) {
    //   curBall.direction.y = -curBall.direction.y;
    // } else if (
    //   curBall.pos.y <= -(GameConfig.playAreaHeight / 2 + BallConfig.radius)
    // ) {
    //   curBall.direction.y = -curBall.direction.y;
    // }
    //TODO: If collision was with a paddle, increase ball speed!!!

    return curBall;
  }

  //Get a new random ball direction and velocity
  getRandomBallDirection(gamestate: GameData): BallData {
    const ballData: BallData = new BallData();
    ballData.pos = new Vec2(0, 0);
    ballData.speed = BallConfig.initialSpeed;

    //Angle needs to be centered on x axis, so need to get offset from y-axis (half the remainder when angle is subracted from 180)
    const angle_offset = (180 - BallConfig.maxServeAngle) / 2;

    //Get a random value in angle range and add the offset
    const angle =
      Math.round(Math.round(Math.random() * BallConfig.maxServeAngle)) +
      angle_offset;

    //Convert the angle to a vector
    ballData.direction = new Vec2(
      Math.sin(degToRad(angle)),
      Math.cos(degToRad(angle))
    );
    //Normalize the vector
    ballData.direction = Vec2.normalize(ballData.direction);

    //If last serve was to the right, invert x value to send left
    if (gamestate.last_serve_side === "right") {
      ballData.direction.x = -ballData.direction.x;
      gamestate.last_serve_side = "left";
    } else gamestate.last_serve_side = "right";

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
    const interval = setInterval(() => {
      this.sendServerUpdate(lobby);
    }, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    logger.debug(`Interval ${name} created`);
  }

  //Delete an interval
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    logger.debug(`Interval ${name} deleted!`);
  }
}
