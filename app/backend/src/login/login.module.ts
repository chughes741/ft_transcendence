import { Module } from "@nestjs/common";
import { LoginService } from "./login.service";
import { LoginGateway } from "./login.gateway";

@Module({
  providers: [LoginGateway, LoginService],
})
export class LoginModule {}
