import * as GameTypes from "./game.types";

export function degToRad(angle: number): number {
  return angle * (Math.PI / 180);
}


export function convertGameState(gameState: GameTypes.GameData) : GameTypes.GameStateDto {

  const res: GameTypes.GameStateDto = new GameTypes.GameStateDto;

  res.ball_pos.x = gameState.ball.pos.x;
  res.ball_pos.y = gameState.ball.pos.y;
  res.paddle_left_pos = gameState.paddle_left.pos.y;
  res.paddle_right_pos = gameState.paddle_right.pos.y;

  return res;
}