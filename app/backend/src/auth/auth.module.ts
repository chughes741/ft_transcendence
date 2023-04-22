import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { SessionSerializer } from "./session.serializer";
import { FortyTwoStrategy } from "./strategy/ft.strategy";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";
import { SharedModule } from "src/share-module.module";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";

@Module({
  imports: [JwtModule.register({}), PrismaModule, TokenModule, TokenStorageModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FortyTwoStrategy,
    JwtStrategy,
    SessionSerializer,
  ]
})
export class AuthModule {}
