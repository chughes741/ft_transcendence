import { CanActivate, Injectable, Logger } from "@nestjs/common";
import { Token, TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

@Injectable()
export default class TokenIsVerified implements CanActivate {
    constructor(private readonly tokenStorage: TokenStorageService) { }

    async refreshToken(clientID: string , refresh_token: Token) {
        //Refresh the Token
        let newToken: Token;
        newToken = refresh_token;
        newToken.created_at = Date.now();
        await this.tokenStorage.removeToken(clientID);
        await this.tokenStorage.addToken(clientID, newToken);
        Logger.log("Refresh : ", newToken)
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const clientId = req.headers['client-id'] as string;
        const clientToken = req.headers['client-token'] as string;

        // Check if token is valid
        const token = this.tokenStorage.getTokenbySocket(clientId)
        console.log("TOKEN TO VERIFY", token, clientToken);
        if (!token || token.access_token !== clientToken) {
            throw new UnauthorizedException();
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = token.expires_in;
        const createdTime = token.created_at;
        const totalValidTime = expiresIn + createdTime;
        if (totalValidTime < currentTime) {
            this.tokenStorage.removeToken(clientId);
            throw new UnauthorizedException();
        }
        await this.refreshToken(clientId, token);
        return true;
    }
}