import { Vec2 } from "../vector";

export class GameConfig {
  static readonly playAreaWidth: number = 16;
  static readonly playAreaHeight: number = 8;
  static readonly serverUpdateRate: number = 17;
  static readonly topLeft: Vec2 = {x: -(GameConfig.playAreaWidth / 2), y: GameConfig.playAreaHeight / 2};
  static readonly topRight: Vec2 = {x: GameConfig.playAreaWidth / 2, y: GameConfig.playAreaHeight / 2};
  static readonly botLeft: Vec2 = {x: -(GameConfig.playAreaWidth / 2), y: -(GameConfig.playAreaHeight / 2)};
  static readonly botRight: Vec2 = {x: GameConfig.playAreaWidth / 2, y: -(GameConfig.playAreaHeight / 2)};
  static readonly maxScore: number = 11;

}
export class PaddleConfig {
  static readonly height: number = 2;
  static readonly width: number = 0.25;
  static readonly depth: number = 0.0;
  static readonly borderOffset: number = 1;
  static readonly paddleLeftTop: Vec2 = {x: -(GameConfig.playAreaWidth / 2) + PaddleConfig.borderOffset, y: GameConfig.playAreaHeight / 2};
  static readonly paddleLeftBot: Vec2 = {x: -(GameConfig.playAreaWidth / 2) + PaddleConfig.borderOffset, y: -(GameConfig.playAreaHeight / 2)};
  static readonly paddleRightTop: Vec2 = {x: (GameConfig.playAreaWidth / 2) - PaddleConfig.borderOffset, y: GameConfig.playAreaHeight / 2};
  static readonly paddleRightBot: Vec2 = {x: (GameConfig.playAreaWidth / 2) - PaddleConfig.borderOffset, y: -(GameConfig.playAreaHeight / 2)};
}

export class BallConfig {
  static readonly initialSpeed: number = 2.5;
  static readonly maxSpeed: number = 10;
  static readonly speedIncreaseInterval: number = 1.1;
  static readonly maxServeAngle: number = 120;
  static readonly radius: number = 0.1;
}

//Colours
export class GameColours {
  static readonly paddle: string = "white";
  static readonly background: string = "black";
  static readonly ball: string = "white";
}