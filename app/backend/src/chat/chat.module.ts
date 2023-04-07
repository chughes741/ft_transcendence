import { Module, forwardRef } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  imports: [PrismaModule],
  providers: [ChatGateway, ChatService, UserConnectionsService, PrismaService]
})
export class ChatModule {}
