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


const logger = new Logger('gameLog');



class Vec2  {
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

  private gameState: GameData = this.initNewGame();


  //Add new gameUpdateInterval
  async addGameUpdateInterval(name: string, milliseconds: number) {
    //Set callback function to gamestate
    const interval = setInterval(this.sendServerUpdate.bind(this), milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    logger.log(`Interval ${name} created!`);
  }

  //Calculate game state and send server update
  async sendServerUpdate() {
    this.server.emit('serverUpdate', {
      gameData: this.calculateGameState(this.gameState)
    });
  }


  //Delete an interval
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    logger.log(`Interval ${name} deleted!`);
  }


  //Calculate game state and return gamestate object
  calculateGameState(gamedata: GameData): GameData {
    //Needs to return paddle locations and ball location
    //Needs to update ball velocity (direction and speed)

    //Check if new round
    if (gamedata.is_new_round) {
      gamedata.last_update_time = Date.now();
      gamedata.ball = this.getRandomBallDirection(gamedata);
      gamedata.is_new_round = false;
    }
    //If not new round, calculate ball position
    else {
      this.updateBall(gamedata);
    }
    return gamedata;
  }

  //Calculate ball position
  updateBall(gameData: GameData) {
    //Save previous ball data
    let prev_ball: BallData = gameData.ball;
    
    //Current ball position is previous ball position + (direction * speed)
    
    gameData.ball
  }

  //Initialize new game
  initNewGame(): GameData {
    let gameData: GameData = new GameData;

    //Setup general game properties
    gameData.is_new_round = true;
    gameData.bounds.width = 6; //FIXME: Change this to be set from config file
    gameData.bounds.height = 4; //FIXME: Change this to be set from config file
    gameData.last_serve_side = 'left'; //FIXME: Change this to be randomized for first serve
    
    //Setup initial ball state
    gameData.ball = this.getRandomBallDirection(gameData);

    //Setup initial paddle state
    gameData.paddle_left.pos.y = 0;
    gameData.paddle_left.pos.x = -2.5; //FIXME: Change this to be set from config fle
    gameData.paddle_right.pos.y = 0;
    gameData.paddle_right.pos.x = -2.5; //FIXME: Change this to be set from config fle

    return gameData;
  }



  //Get a new random ball direction and velocity
  getRandomBallDirection(gameData: GameData): BallData {
    let ballData: BallData = new BallData;
    ballData.pos.x = 0;
    ballData.pos.y = 0;
    ballData.speed = 5; //FIXME: Change this to be set from config file, and have a random modifier applied

    //Choose which side to send serve to based on last serve
    if (gameData.last_serve_side === 'left') {
      ballData.direction.x = 1; //FIXME: Change so possible range of angles is set from config file, and have a random modifier applied
      ballData.direction.y = 0; //FIXME: Change so possible range of angles is set from config file, and have a random modifier applied
    }
    else {
      ballData.direction.x = 1; //FIXME: Change so possible range of angles is set from config file, and have a random modifier applied
      ballData.direction.y = 0; //FIXME: Change so possible range of angles is set from config file, and have a random modifier applied
    }
    
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
