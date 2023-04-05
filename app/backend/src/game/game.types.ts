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

export class PlayerQueue {
  client_id: string;
  join_time: number;
  client_mmr: number;
  socket_id: string; //Temporary
}

/**
 * Players and spectators are both arrays of clientIDs
 */
export class gameLobby {
  players: string[];
  spectators: string[];
  lobby_id: string;
  match_id: string;
  gamestate: GameData;
  created_at: number;
}


export class ClientGameStateUpdate {
  match_id: string;
  player_side: string;
  paddle_pos: number;
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