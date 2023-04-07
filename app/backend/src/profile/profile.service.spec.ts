import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "src/profile/profile.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("ProfileService", () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, PrismaService, ConfigService]
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
