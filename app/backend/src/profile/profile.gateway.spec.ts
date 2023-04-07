import { Test, TestingModule } from "@nestjs/testing";
import { ProfileGateway } from "./profile.gateway";
import { ProfileService } from "./profile.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

describe("ProfileGateway", () => {
  let gateway: ProfileGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileGateway, ProfileService, PrismaService, ConfigService]
    }).compile();

    gateway = module.get<ProfileGateway>(ProfileGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
