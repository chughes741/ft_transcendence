import { CanActivate, Injectable } from "@nestjs/common";
import { TokenStorageService } from "./token-storage.service";
import { UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

@Injectable()
export default class TokenIsVerified implements CanActivate {
    constructor(private readonly tokenStorage: TokenStorageService) { }

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
        return true;
    }
}