import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { SessionSerializer } from "./session.serializer";
import { FortyTwoStrategy } from "./strategy/ft.strategy";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import { TokenStorageService } from "src/tokenstorage/token-storage.service";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";

@Module({
  imports: [JwtModule.register({}), PrismaModule, TokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FortyTwoStrategy,
    JwtStrategy,
    SessionSerializer,
    TokenIsVerified,
  ]
})
export class AuthModule {}
