import { GameState } from "kingpong-lib";
import { PaddleConfig, BallConfig, GameConfig } from "./game.config";

export class Vec2 {
  x: 0;
  y: 0;
}

export class BallData {
  pos: Vec2 = new Vec2();
  direction: Vec2 = new Vec2();
  speed: number = BallConfig.initialSpeed;
}

export class PaddleData {
  pos: Vec2 = new Vec2();
  height: number = PaddleConfig.height;
  width: number = PaddleConfig.width;
  depth: number = PaddleConfig.depth;
}

export class GameBounds {
  width: number = GameConfig.playAreaWidth;
  height: number = GameConfig.playAreaHeight;
}

export class GameData {
  last_update_time: 0;
  is_new_round: false;
  last_serve_side: "left";
  bounds: GameBounds = new GameBounds();
  ball: BallData = new BallData();
  paddle_left: PaddleData = new PaddleData();
  paddle_right: PaddleData = new PaddleData();
}

export class GameStateDto {
  constructor(
    Match_Id: string,
    Player_Side: string,
    Ball_Pos_x: number,
    Ball_Pos_y: number,
    Paddle_Left_Pos: number,
    Paddle_Right_Pos: number
  ) {
    this.match_id = Match_Id;
    this.player_side = Player_Side;
    this.ball_pos_x = Ball_Pos_x;
    this.ball_pos_y = Ball_Pos_y;
    this.paddle_left_pos = Paddle_Left_Pos;
    this.paddle_right_pos = Paddle_Right_Pos;
  }

  match_id: string;
  player_side: string;
  ball_pos_x: number;
  ball_pos_y: number;
  paddle_left_pos: number;
  paddle_right_pos: number;
}

export class ClientGameStateUpdate {
  match_id: string;
  player_side: string;
  paddle_pos: number;
}

export class PlayerReadyDto {
  constructor(Lobby_ID: string, Is_Ready: boolean) {
    this.lobby_id = Lobby_ID;
    this.is_ready = Is_Ready;
  }
  lobby_id: string;
  is_ready: boolean;
}

export class LobbyCreatedDto {
  constructor(Lobby_ID) {
    this.lobby_id = Lobby_ID;
  }
  lobby_id: string;
  player_side: string;
}

export class GameStartedDto {
  match_id: string;
  player_side: string;
}

export class Lobby {
  constructor(Lobby_ID: string, Player_Side: string) {
    this.lobby_id = Lobby_ID;
    this.player_side = Player_Side;
    this.game_state = new GameState();
    this.game_state.ball_x = 0;
    this.game_state.ball_y = 0;
    this.game_state.paddle_left_y = 0;
    this.game_state.paddle_right_y = 0;
  }
  player_side: string;
  lobby_id: string;
  player_name: string;
  opponent_name: string;
  player_avatar: string;
  opponent_avatar: string;
  player_ready: boolean;
  opponent_ready: boolean;
  game_state: GameState;
}
