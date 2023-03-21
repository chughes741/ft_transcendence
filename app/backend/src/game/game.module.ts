import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";

@Module({
  providers: [GameGateway, GameService, GameLogic, GameModuleData]
})
export class GameModule {}
