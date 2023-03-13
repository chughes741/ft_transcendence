import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module";
import { LoginService } from "./login.service";

describe("LoginService", () => {
  let service: LoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [LoginService]
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
