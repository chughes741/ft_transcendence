// jwt-ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class JwtWsAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.query.token;

    if (!token) {
      throw new WsException("Missing token");
    }

    try {
      const secret = this.config.get("JWT_SECRET");
      this.jwt.verify(token, { secret });
      return true;
    } catch (error) {
      throw new WsException("Invalid token");
    }
  }
}
