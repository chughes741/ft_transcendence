import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module";
import { LoginGateway } from "./login.gateway";
import { LoginService } from "./login.service";

describe("LoginGateway", () => {
  let gateway: LoginGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [LoginGateway, LoginService]
    }).compile();

    gateway = module.get<LoginGateway>(LoginGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
