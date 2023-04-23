import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TokenStorageService } from "src/tokenstorage/token-storage.service";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";
import { TokenModule } from "src/tokenstorage/token-verify.module";

@Module({
  imports: [PrismaModule, TokenStorageModule, TokenModule],
  providers: [
    ChatGateway,
    ChatService,
    UserConnectionsService,
    PrismaService,
    TokenStorageService
  ]
})
export class ChatModule {}
