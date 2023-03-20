import { ScheduleModule, SchedulerRegistry } from "@nestjs/schedule";
import { Test, TestingModule } from "@nestjs/testing";
import { GameLogic } from "./game.logic";
import { GameService } from "./game.service";

describe("GameService", () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, GameLogic, SchedulerRegistry]
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
