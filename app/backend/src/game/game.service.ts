import { Injectable } from "@nestjs/common";
import { Interval } from '@nestjs/schedule';
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from 'socket.io';

import { Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import * as vec2 from 'gl-vec2';
// import {
  // ClientReadyEvent,
  // ClientUpdateEvent,
  // CreateLobbyEvent,
  // InvitePlayerEvent,
  // JoinLobbyEvent
// } from "../../../shared/events/game.events";

import { GameConfig, PaddleConfig, BallConfig } from "./config/game.config";

const logger = new Logger('gameLog');


class Vec2 {
  x: number;
  y: number;
}

class BallData {
  pos: Vec2 = new Vec2;
  direction: Vec2 = new Vec2;
  speed: number;
}

class PaddleData {
  pos: Vec2 = new Vec2;
}

class GameBounds {
  width: number;
  height: number;
}

class GameData {
  last_update_time: number;
  is_new_round: boolean;
  last_serve_side: string;
  bounds: GameBounds = new GameBounds;
  ball: BallData = new BallData;
  paddle_left: PaddleData = new PaddleData;
  paddle_right: PaddleData = new PaddleData;
}

function degToRad(angle: number): number {
  return (angle * (Math.PI / 180));
}

//Setup websocket gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

@Injectable()
export class GameService {

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  static rot: number = 0;

  @WebSocketServer()
  public server: Server;

  private gameState: GameData;


  //Create a new game instance
  async createGame() {
    //Create new gameData object
    this.gameState = this.initNewGame();
    logger.log('New game object created')
    //Add the gameUpdateInterval
    // if (!this.schedulerRegistry.getInterval('gameUpdateInterval'))
      this.addGameUpdateInterval('gameUpdateInterval', GameConfig.serverUpdateRate);
  }


  //Add new gameUpdateInterval
  async addGameUpdateInterval(name: string, milliseconds: number) {
    //Set callback function to gamestate
    const interval = setInterval(this.sendServerUpdate.bind(this), milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    logger.log(`Interval ${name} created`);
  }

  //Calculate game state and send server update
  async sendServerUpdate() {
    this.gameState = this.calculateGameState(this.gameState);
    this.server.emit('serverUpdate', {
      x: this.gameState.ball.pos.x,
      y: this.gameState.ball.pos.y,
    });
  }


  //Delete an interval
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    logger.log(`Interval ${name} deleted!`);
  }


  //Calculate game state and return gamestate object
  calculateGameState(gameData: GameData): GameData {
    //Needs to return paddle locations and ball location
    //Needs to update ball velocity (direction and speed)

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
    let prev: BallData = gameData.ball;
    let cur: BallData = new BallData;

    //Current ball position is previous ball position + (direction * speed)
    let time_diff: number = (Date.now() - gameData.last_update_time) / 1000;

    [cur.pos.x, cur.pos.y] = vec2.scaleAndAdd([cur.pos.x, cur.pos.y],[prev.pos.x, prev.pos.y], [prev.direction.x, prev.direction.y], prev.speed * time_diff);
    cur.direction = prev.direction;
    cur.speed = prev.speed;

    //Check for collision with each wall
    //hacky temporary solve
    if (cur.pos.x >= (GameConfig.playAreaWidth / 2) -0.1) {
      cur.direction.x = -cur.direction.x
    }
    else if (cur.pos.x <= -(GameConfig.playAreaWidth / 2) + 0.1) {
      cur.direction.x = -cur.direction.x;
    }
    else if (cur.pos.y >= (GameConfig.playAreaHeight / 2) - 0.1) {
      cur.direction.y = -cur.direction.y;
    }
    else if (cur.pos.y <= -(GameConfig.playAreaHeight / 2) + 0.1) {
      cur.direction.y = -cur.direction.y;
    }

    return cur;
  }

  //Initialize new game
  initNewGame(): GameData {
    let gameData: GameData = new GameData;

    //Setup general game properties
    gameData.is_new_round = true;
    gameData.bounds.width =  GameConfig.playAreaWidth;
    gameData.bounds.height = GameConfig.playAreaHeight;
    
    //Randomize serve side for initial serve
    if (Math.round(Math.random()) === 0)
      gameData.last_serve_side = 'left';
    else
      gameData.last_serve_side = 'right';

    //Setup initial paddle state
    gameData.paddle_left.pos.y = 0;
    gameData.paddle_left.pos.x = -((GameConfig.playAreaWidth / 2) - PaddleConfig.borderOffset);
    gameData.paddle_right.pos.y = 0;
    gameData.paddle_right.pos.x = ((GameConfig.playAreaWidth / 2) - PaddleConfig.borderOffset);
  
    return gameData;
  }

  //Get a new random ball direction and velocity
  getRandomBallDirection(gameData: GameData): BallData {
    let ballData: BallData = new BallData;
    ballData.pos.x = 0;
    ballData.pos.y = 0;
    ballData.speed = BallConfig.initialSpeed;

    //Angle needs to be centered on x axis, so need to get offset from y-axis (half the remainder when angle is subracted from 180)
    let angle_offset = (180 - BallConfig.maxServeAngle) / 2;

    //Get a random value in angle range and add the offset
    let angle = Math.round(Math.round(Math.random() * BallConfig.maxServeAngle)) + angle_offset;

    //Convert the angle to a vector
    [ballData.direction.x, ballData.direction.y] =  vec2.set([ballData.direction.x, ballData.direction.y], Math.sin(degToRad(angle)), Math.cos(degToRad(angle)));
    
    //Normalize the vector
    [ballData.direction.x, ballData.direction.y] = vec2.normalize([ballData.direction.x, ballData.direction.y], [ballData.direction.x, ballData.direction.y])

    //If last serve was to the right, invert x value to send left
    if (gameData.last_serve_side === 'right') {
      ballData.direction.x = -ballData.direction.x;
      gameData.last_serve_side = 'left';
    }
    else
      gameData.last_serve_side = 'right';

    return ballData;
  }



  /**
   *
   * @param createLobbyEvent
   * @emits JoinLobbyReply
   */
  // async createLobby(createLobbyEvent: CreateLobbyEvent): Promise<string> {
    // /** @todo implementation */
    // return "Created a new lobby";
  // }

  /**
   *
   * @param joinLobbyEvent
   * @emits JoinLobbyReply
   */
  // async joinLobby(joinLobbyEvent: JoinLobbyEvent): Promise<string> {
    // /** @todo implementation */
    // return "Joined a lobby";
  // }

  /**
   *
   * @param invitePlayerEvent
   */
  // async invitePlayer(invitePlayerEvent: InvitePlayerEvent): Promise<string> {
    // /** @todo implementation */
    // return "Invited a player";
  // }

  /**
   *
   * @param clientReadyEvent
   */
  // async clientReady(clientReadyEvent: ClientReadyEvent): Promise<string> {
    /** @todo implementation */
    // return "Client is ready";
  // }

  /**
   *
   * @param clientUpdateEvent
   */
  // async clientUpdate(clientUpdateEvent: ClientUpdateEvent): Promise<string> {
    /** @todo implementation */
    // return "Client is updated";
  // }

  /**
   * 
   * @returns 
   * @emits GameStartEvent
   */
  // async gameStart() {
    /** @todo implementation */
    // return "Game has started"
  // }
}
