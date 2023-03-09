import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";
import { ConfigService } from "@nestjs/config";

describe("PrismaService", () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, PrismaService]
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
