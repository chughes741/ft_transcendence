import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthService } from "./auth.service";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule.forRoot(), JwtModule, TokenModule],
      providers: [AuthService, TokenIsVerified]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
