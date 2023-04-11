import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { type User } from "@prisma/client";

const logger = new Logger("JwtStrategy");

// This class is also a provider
@Injectable()
// set as 'jwt' by default, but any other identifier can be passed
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    // Ensures that the provided JWT's secret was issued by our server
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("JWT_SECRET")
    });
  }

  /**
   * Used automatically by Express to validate the token
   * @param payload Contents of the JTW
   * @returns Will be appended the payload to the user object of the request object
   */
  async validate(payload: { id: string; email: string }): Promise<User> {
    if (!payload.id) {
      logger.error("Invalid payload ID");
      return null;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id
      }
    });

    // TODO: add business logic to throw unifies HttpStatus in case of error

    delete user.hash; // Remove sensitive data before returning
    return user;
  }
}
