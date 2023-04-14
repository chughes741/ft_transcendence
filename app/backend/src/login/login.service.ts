import {
  Body,
  Injectable,
  Logger,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as argon from "argon2";
import { WsException } from "@nestjs/websockets";
import { AuthRequest } from "../auth/dto";

@Injectable()
export class LoginService {
  constructor(private prismaService: PrismaService) {}

  /**
   *
   * @param loginDto
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: AuthRequest) {
    console.log(dto);

    try {
      const user = await this.prismaService.user.create({
        data: {
          username: dto.username,
          lastName: dto.lastName,
          firstName: dto.firstName,
          email: dto.email,
          avatar: dto.avatar
        }
      });
      Logger.log("Successfully created user " + user.username + ".");
      return user;
    } catch (error) {
      Logger.log("error code: " + error.code);
      Logger.error(error);
      throw new WsException(error.code);
    }
  }
}
