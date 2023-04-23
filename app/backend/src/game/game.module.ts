import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [ChatModule],
  providers: [GameGateway, GameService, GameLogic, GameModuleData]
})
export class GameModule {}
