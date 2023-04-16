import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { SessionSerializer } from "./session.serializer";
import { FortyTwoStrategy } from "./strategy/ft.strategy";
import { TokenStorageService } from "../token-storage.service";

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    FortyTwoStrategy,
    JwtStrategy,
    SessionSerializer,
    TokenStorageService
  ]
})
export class AuthModule {}
