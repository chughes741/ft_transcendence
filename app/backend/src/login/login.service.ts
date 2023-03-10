import { Injectable, Logger, UsePipes, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as argon from "argon2";
import { MessageBody, WebSocketServer, WsException } from "@nestjs/websockets";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class LoginService {
  constructor(private prismaService: PrismaService) {}
  transformToDto(obj: any): LoginDto {
    const { email, password } = obj;
    return new LoginDto(email, password);
  }

  /**
   *
   * @param loginDto
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(message: any) {
    const body = JSON.parse(message);
    const dto = this.transformToDto(body);
    console.log(dto);

    try {
      const hash = await argon.hash(dto.password);
      Logger.log("dto.email: " + dto.email);
      Logger.log("dto.hash: " + dto.password);
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash
        }
      });
      Logger.log("Successfully created user " + user.email + ".");
      return user;
    } catch (error: WsException | any) {
      Logger.log("error code: " + error.code);
      Logger.error(error);
      throw new WsException(error.code);
    }
  }

  /**
   *
   * @param loginDto
   */
  signup(loginDto: LoginDto) {
    //Check if username already exists
  }
}
