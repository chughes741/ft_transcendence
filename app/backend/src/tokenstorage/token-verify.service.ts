import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Token, TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

const logger = new Logger("TokenVerification");

@Injectable()
export default class TokenIsVerified implements CanActivate {
    constructor(public tokenStorage: TokenStorageService) { }

  async refreshToken(clientID: string, refresh_token: Token) {
    //Refresh the Token

    refresh_token.created_at = Date.now();
    refresh_token.expires_in = 7200;
    console.log("Inside refresh Token");
    /*
        const newToken = refresh_token;
        newToken.created_at = Date.now();
        newToken.expires_in = 7200;
        await this.tokenStorage.removeToken(clientID);
        await this.tokenStorage.addToken(clientID, newToken);
        */
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const clientId = req.headers["client-id"] as string;
    const clientToken = req.headers["client-token"] as string;

   // logger.log("Client ID : ", clientId, "Clietn Token : ", clientToken);

    // Check if token is valid
    const token = await this.tokenStorage.getTokenbySocket(clientId);
    if (!token || token.access_token !== clientToken) {
      logger.log("Token verification failure");
      throw new UnauthorizedException();
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = token.expires_in;
    const createdTime = token.created_at;
    const totalValidTime = expiresIn + createdTime;
    console.log(totalValidTime, currentTime);
    if (totalValidTime < currentTime) {
      this.tokenStorage.removeToken(clientId);
      logger.log("Token has expired");
      throw new UnauthorizedException()
    }
    logger.log("Token verification SUCCESS");
    await this.refreshToken(clientId, token);
    return true;
  }
}
