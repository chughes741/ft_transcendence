import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [GameGateway, GameService, GameLogic, GameModuleData]
})
export class GameModule {}
