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
  match_id: string;
  player_side: string;
  ball_pos:{
    x: number,
    y: number
  };
  paddle_left_pos: number;
  paddle_right_pos: number;
}

export class ClientGameStateUpdate {
  match_id: string;
  player_side: string;
  paddle_pos: number;
}


