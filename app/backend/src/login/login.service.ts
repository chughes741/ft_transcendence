import {
  Body,
  Injectable,
  Logger,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WsException } from "@nestjs/websockets";
import { AuthRequest } from "../auth/dto";

const logger = new Logger("LoginService");

@Injectable()
export class LoginService {
  constructor(private prismaService: PrismaService) {}

  /**
   *
   * @param loginDto
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: AuthRequest) {
    logger.debug("ValidationPipe:", dto);

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
      logger.debug("Successfully created user", user.username);
      return user;
    } catch (error) {
      logger.error(error);
      throw new WsException(error.code);
    }
  }
}
