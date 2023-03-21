import { Test, TestingModule } from "@nestjs/testing";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

describe("ChatGateway", () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ChatGateway, ChatService, UserConnectionsService]
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
