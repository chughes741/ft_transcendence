import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Token, TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

const logger = new Logger("TokenVerification");

@Injectable()
export default class TokenIsVerified implements CanActivate {
  constructor(public tokenStorage: TokenStorageService) {}

  async refreshToken(clientID: string, refresh_token: Token) {
    //Refresh the Token
    refresh_token.created_at = Date.now();
    refresh_token.expires_in = 7200;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isWebSocket = context.getType() === "ws";
    let clientId: string;
    let clientToken: string;
    let client;
    if (isWebSocket) {
      client = await context.switchToWs().getClient();
      const newheaders = client.handshake.headers;
      clientId = (await client.id) as string;
      clientToken = (await newheaders.clienttoken) as string;
    } else {
      const req = context.switchToHttp().getRequest();
      clientId = req.headers["client-id"] as string;
      clientToken = req.headers["client-token"] as string;
    }
    // Check if token is valid
    const token = await this.tokenStorage.getTokenbySocket(clientId);
    if (!token || token.access_token !== clientToken) {
      logger.error("Token verification Failure");
      if (isWebSocket) client.emit("unauthorized");
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = token.expires_in;
    const createdTime = token.created_at;
    const totalValidTime = expiresIn + createdTime;
    if (totalValidTime < currentTime) {
      this.tokenStorage.removeToken(clientId);
      logger.warn("Token has expired");
      if (isWebSocket) client.emit("unauthorized");
      return false;
    }
    logger.debug("Token verification Success");
    await this.refreshToken(clientId, token);
    return true;
  }
}
