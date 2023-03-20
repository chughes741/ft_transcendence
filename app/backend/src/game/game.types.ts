export class Vec2 {
  x: number;
  y: number;
}

export class BallData {
  pos: Vec2 = new Vec2();
  direction: Vec2 = new Vec2();
  speed: number;
}

export class PaddleData {
  pos: Vec2 = new Vec2();
}

export class GameBounds {
  width: number;
  height: number;
}

export class GameData {
  last_update_time: number;
  is_new_round: boolean;
  last_serve_side: string;
  bounds: GameBounds = new GameBounds();
  ball: BallData = new BallData();
  paddle_left: PaddleData = new PaddleData();
  paddle_right: PaddleData = new PaddleData();
  player_left_ready: boolean;
  player_right_ready: boolean;
}

export class Lobby {
  //LobbyID can also be the name for the websocket room
  lobby_ID: string;
  gameState: GameData;
  chatroom_ID: string;
}
