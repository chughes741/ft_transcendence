import { PARAMTYPES_METADATA } from "@nestjs/common/constants";


export class PaddleConfig {
	static readonly height: number = 0.5;
	static readonly borderOffset: number = 0.1;
}

export class BallConfig {
	static readonly initialSpeed: number = 0.75;
	static readonly maxSpeed: number = 2;
	static readonly maxServeAngle: number = 120;
	static readonly radius: number = 0.1;
}

export class GameConfig {
	static readonly playAreaWidth: number = 6;
	static readonly playAreaHeight: number = 4;
	static readonly serverUpdateRate: number = 17;
}