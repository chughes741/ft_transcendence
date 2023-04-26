import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Token, TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { WebSocketServer } from '@nestjs/websockets';

const logger = new Logger("TokenVerification");

@Injectable()
export default class TokenIsVerified implements CanActivate {
  constructor(public tokenStorage: TokenStorageService) { }

  async refreshToken(clientID: string, refresh_token: Token) {
    //Refresh the Token
    refresh_token.created_at = Date.now();
    refresh_token.expires_in = 7200;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    console.log("Tokens :", this.tokenStorage.tokens);

    const isWebSocket = context.getType() === 'ws';
    let clientId: string;
    let clientToken: string;
    if (isWebSocket) {
      console.log("Websockets found")
      const client = await context.switchToWs().getClient();
      const newheaders = client.handshake.headers;
      //console.log("CLIENT: ", client)
      //console.log("QUERRY : ", client.handshake.QUERRY)
      clientId = await client.id as string;
      clientToken = await newheaders.clienttoken as string;
    }
    else {
      const req = context.switchToHttp().getRequest();
      clientId = req.headers["client-id"] as string;
      clientToken = req.headers["client-token"] as string;
    }
    logger.log("Client ID : ", clientId, "Client Token : ", clientToken);
    //const clientId = req.headers["client-id"] as string;
    //const clientToken = req.headers["client-token"] as string;


    // Check if token is valid
    const token = await this.tokenStorage.getTokenbySocket(clientId);
    console.log("Stored token", token);
    if (!token || token.access_token !== clientToken) {
      logger.error("Token verification Failure");
      throw new UnauthorizedException();
    }
    console.log("Token is same")

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = token.expires_in;
    const createdTime = token.created_at;
    const totalValidTime = expiresIn + createdTime;
    if (totalValidTime < currentTime) {
      this.tokenStorage.removeToken(clientId);
      logger.warn("Token has expired");
      throw new UnauthorizedException();
    }
    console.log("Token is verified")
    logger.debug("Token verification Success");
    await this.refreshToken(clientId, token);
    return true;
  }
}
