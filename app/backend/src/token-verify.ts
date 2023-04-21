import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Token, TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import axios from "axios";

const logger = new Logger("TokenVerification");

@Injectable()
export default class TokenIsVerified implements CanActivate {
    constructor(private readonly tokenStorage: TokenStorageService) { }

    async refreshToken(clientID: string , refresh_token: Token) {
        //Refresh the Token
        let newToken: Token;
        newToken = refresh_token;
        /*
        const response = await axios.post( "https://api.intra.42.fr/oauth/token",
          {
            grant_type: "refresh_token",
            client_id: process.env.UID,
            client_secret: process.env.SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            refresh_token: refresh_token.refresh_token,
          }
        );
        const data = response.data;
        console.log("NEW REFRESH TOKEN INFO " , data)*/
        
        newToken.created_at = Date.now();
        newToken.expires_in = 7200;
        console.log("PREVIOUS TOKEN INFO", refresh_token)
        console.log("New TOKEN INFO", newToken)
        await this.tokenStorage.removeToken(clientID);
        await this.tokenStorage.addToken(clientID, newToken);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        
        const clientId = req.headers['client-id'] as string;
        const clientToken = req.headers['client-token'] as string;

        // Check if token is valid
        const token = this.tokenStorage.getTokenbySocket(clientId)
        console.log(token);
        console.log("STUFF TO MAKE IT WORK :" , clientId, clientToken);
        if (!token || token.access_token !== clientToken) {
            logger.log("Token verification failure")
            throw new UnauthorizedException();
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = token.expires_in;
        const createdTime = token.created_at;
        const totalValidTime = expiresIn + createdTime;
        console.log(totalValidTime, currentTime)
        if (totalValidTime < currentTime) {
            this.tokenStorage.removeToken(clientId);
            logger.log("Token has expired")
            throw new UnauthorizedException();
        }

        logger.log("Token verification Success")
        await this.refreshToken(clientId, token);
        return true;
    }
}