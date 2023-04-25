import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { UserConnectionsService } from "../user-connections.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { TokenStorageService } from "src/tokenstorage/token-storage.service";

@Module({
  imports: [PrismaModule, TokenModule, TokenStorageModule],
  providers: [
    ChatGateway,
    ChatService,
    UserConnectionsService,
    PrismaService,
    TokenIsVerified,
    TokenStorageService
  ]
})
export class ChatModule {}
