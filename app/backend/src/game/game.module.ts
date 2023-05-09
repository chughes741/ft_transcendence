import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";
import { GameModuleData } from "./game.data";
import { ChatModule } from "../chat/chat.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "src/user-connections.service";
@Module({
  imports: [PrismaModule, ChatModule],
  providers: [GameGateway, GameService, GameLogic, GameModuleData, UserConnectionsService]
})
export class GameModule {}
