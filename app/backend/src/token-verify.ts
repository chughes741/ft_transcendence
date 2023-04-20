import { Injectable } from "@nestjs/common";
import { NestMiddleware } from "@nestjs/common";
import { TokenStorageService } from "./token-storage.service";
import { NextFunction } from "express";

@Injectable()
export default class TokenIsVerified implements NestMiddleware {
    constructor(private readonly tokenStorage: TokenStorageService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const clientId = req.headers['client-id'] as string;
        const clientToken = req.headers['client-token'] as string;

        // Check if token is valid
        const token = this.tokenStorage.getTokenbySocket(clientId)
        console.log("TOKEN TO VERIFY", token, clientToken);
        if (!token || token.access_token !== clientToken) {
            let response;
            response.status = 401;
            return response.json({ message: 'Unauthorized' });
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const expiresIn = token.expires_in;
        const createdTime = token.created_at;
        const totalValidTime = expiresIn + createdTime;
        if (totalValidTime < currentTime) {
            this.tokenStorage.removeToken(clientId);
            let response;
            response.status = 401;
            return response.json({ message: 'Unauthorized' });
        }
        next();
    }
}