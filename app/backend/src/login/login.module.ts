import { Module } from "@nestjs/common";
import { LoginService } from "./login.service";
import { LoginGateway } from "./login.gateway";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [PrismaModule],
  providers: [LoginGateway, LoginService, PrismaService]
})
export class LoginModule {}
