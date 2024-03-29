export class PaddleConfig {
  static readonly height: number = 2;
  static readonly width: number = 0.25;
  static readonly depth: number = 0.0;
  static readonly borderOffset: number = 1;
}

export class BallConfig {
  static readonly initialSpeed: number = 0.75;
  static readonly maxSpeed: number = 2;
  static readonly maxServeAngle: number = 120;
  static readonly radius: number = 0.1;
}

export class GameConfig {
  static readonly playAreaWidth: number = 16;
  static readonly playAreaHeight: number = 8;
  static readonly serverUpdateRate: number = 17;
  static readonly backgroundZOffset: number = -5;
}

//Colours
export class GameColours {
  static readonly paddle: string = "white";
  static readonly backgrounds: string[] = [
    "Black",
    "DarkSlateGray",
    "SteelBlue",
    "RoyalBlue",
    "DarkCyan",
    "DarkGoldenrod",
    "DarkOliveGreen",
    "SaddleBrown",
    "Sienna",
    "DarkMagenta",
    "MidnightBlue",
  ];
  static readonly ball: string = "white";
}
