import { Injectable, Logger } from "@nestjs/common";

const logger = new Logger("UserConnectionsService");

export class Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;

  constructor(
    access_token: string,
    refresh_token: string,
    token_type = "bearer",
    expires_in = 7200,
    scope = "public",
    created_at: number = Date.now()
  ) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.token_type = token_type;
    this.expires_in = expires_in;
    this.scope = scope;
    this.created_at = created_at;
  }
}

@Injectable()
export class TokenStorageService {
  private tokens: Map<string, Token> = new Map();

  // Returns all of the socketIds for a given user
  getToken(username: string): Token {
    return this.tokens.get(username);
  }

  getSocketByToken(access_token: string): string {
    // Find the socket that contains the token
    const socket = Array.from(this.tokens.entries()).find(
      ([, token]) => token.access_token === access_token
    );
    return socket ? socket[0] : null;
  }

  addToken(socketId: string, token: Token): void {
    // Add the token to the map
    this.tokens.set(socketId, token);
    logger.warn(`Added ${token} to ${socketId}.`);
  }

  removeToken(socketId: string): void {
    if (this.tokens.has(socketId)) {
      delete this.tokens[socketId];
      logger.warn(`Removed ${socketId} from TokenStorage.`);
    }
  }
}
