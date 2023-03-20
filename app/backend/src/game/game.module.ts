import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";

@Module({
  providers: [GameGateway, GameService, GameLogic]
})
export class GameModule {}
