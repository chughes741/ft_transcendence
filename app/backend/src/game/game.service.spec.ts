import { SchedulerRegistry } from "@nestjs/schedule";
import { Test, TestingModule } from "@nestjs/testing";
import { GameModuleData } from "./game.data";
import { GameLogic } from "./game.logic";
import { GameService } from "./game.service";
import { PrismaModule } from "../prisma/prisma.module";

describe("GameService", () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [GameService, GameLogic, SchedulerRegistry, GameModuleData]
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
