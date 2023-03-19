import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

describe("ChatGateway", () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ChatGateway, ChatService]
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
