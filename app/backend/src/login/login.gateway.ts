import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { LoginService } from "./login.service";
import { LoginDto } from "./dto/login.dto";
import { UseFilters } from "@nestjs/common";
import { PrismaClientExceptionFilterWs } from "../prisma-client-exception.filter";

export enum LoginEnum {
  login = "login",
  signup = "signup"
}

/**
 *  Preauthorization gateway
 */
@UseFilters(new PrismaClientExceptionFilterWs())
@WebSocketGateway()
export class LoginGateway {
  constructor(private readonly loginService: LoginService) {}

  /**
   * @param
   * @login Log into an existing user account
   * @return Return success with JWT or failure
   */
  @SubscribeMessage(LoginEnum.login)
  login(@MessageBody() loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  /**
   * @param
   * @signup Create a new user account
   * @return Return success with JWT or failure
   */
  @SubscribeMessage(LoginEnum.signup)
  signup(@MessageBody() loginDto: LoginDto) {
    return this.loginService.signup(loginDto);
  }
}
