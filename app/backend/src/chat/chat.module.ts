import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, ChatService, UserConnectionsService]
})
export class ChatModule {}
