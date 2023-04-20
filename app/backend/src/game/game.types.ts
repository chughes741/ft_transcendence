import { Vec2 } from "./vector";



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
  match_id: string;
  last_update_time: number;
  is_new_round: boolean;
  last_serve_side: string;
  bounds: GameBounds = new GameBounds();
  ball: BallData = new BallData();
  paddle_left: PaddleData = new PaddleData();
  paddle_right: PaddleData = new PaddleData();
  players_ready: number;
  players: string[];
  score: number[];
}

export class PlayerQueue {
  username: string;
  join_time: number;
  // client_mmr: number;
  socket_id: string;
}

export class gameLobby {
  players: string[];
  ready: number[];
  spectators: string[];
  lobby_id: string;
  match_id: string;
  gamestate: GameData;
  created_at: number;
}

export class ClientGameStateUpdate {
  username: string;
  match_id: string;
  lobby_id: string;
  player_side: string;
  paddle_pos: number;
}