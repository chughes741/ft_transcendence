import { SchedulerRegistry } from "@nestjs/schedule";
import { Test, TestingModule } from "@nestjs/testing";
import { GameModuleData } from "./game.data";
import { GameGateway } from "./game.gateway";
import { GameLogic } from "./game.logic";
import { GameService } from "./game.service";
import { ChatModule } from "../chat/chat.module";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "src/user-connections.service";

describe("GameGateway", () => {
  let gateway: GameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChatModule, PrismaModule],
      providers: [
        GameGateway,
        GameService,
        SchedulerRegistry,
        GameLogic,
        GameModuleData,
        UserConnectionsService
      ]
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
