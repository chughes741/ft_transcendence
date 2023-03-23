import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private config: ConfigService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return false;
    }

    try {
      const token = authorization.split(" ")[1]; // After the 'Bearer' word
      const secret = this.config.get("JWT_SECRET");
      this.jwt.verify(token, { secret });
      return true;
    } catch (error) {
      return false;
    }
  }
}
