import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { SessionSerializer } from "./session.serializer";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import TokenIsVerified from "src/tokenstorage/token-verify.service";

@Module({
  imports: [JwtModule.register({}), PrismaModule, TokenModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionSerializer, TokenIsVerified]
})
export class AuthModule {}
