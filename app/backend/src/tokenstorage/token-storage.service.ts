import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

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
    token_type: string = "bearer",
    expires_in: number = 7200,
    scope: string = "public",

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
  public tokens: Map<string, Token> = new Map();

  // Returns all of the socketIds for a given user
  getToken(username: string): Token {
    return this.tokens.get(username);
  }

  async getTokenbySocket(socketID: string): Promise<Token> {
    logger.log(this.tokens);
    return await this.tokens.get(socketID);
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
    logger.warn(`Added [Token]${token.access_token} to [Socket] ${socketId}.`);
  }

  removeToken(socketId: string): void {
    if (this.tokens.has(socketId)) {
      this.tokens.delete(socketId);
      logger.warn(`Removed [Socket]:${socketId}'s token from TokenStorage.`);
    }
  }

  async refresh42Token(previous: Token): Promise<Token> {
    logger.log("Refreshing token");
    const response = await axios.post("https://api.intra.42.fr/oauth/token", {
      grant_type: "refresh_token",
      client_id: process.env.UID,
      client_secret: process.env.SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      refresh_token: previous.refresh_token
    });
    const data = response.data;
    const token = new Token(
      data.access_token,
      data.refresh_token,
      data.token_type,
      data.expires_in,
      data.scope,
      data.created_at
    );
    logger.log("Refreshed token: ", token);
    return token;
  }
}
