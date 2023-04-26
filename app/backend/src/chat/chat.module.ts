import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import TokenIsVerified from "src/tokenstorage/token-verify.service";

@Module({
  imports: [PrismaModule, TokenModule],
  providers: [ChatGateway, ChatService, UserConnectionsService, PrismaService, TokenIsVerified]
})
export class ChatModule { }
