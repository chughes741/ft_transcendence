// [app/backend/src/chat/user-connections.service.ts]

import { Injectable, Logger } from "@nestjs/common";

const logger = new Logger("UserConnectionsService");

@Injectable()
export class UserConnectionsService {
  private userConnections: Map<string, string[]> = new Map();

  addUserConnection(username: string, socketId: string): void {
    if (!this.userConnections.has(username)) {
      this.userConnections.set(username, []);
    }
    this.userConnections.get(username).push(socketId);
    // TODO: remove this log
    logger.log(
      `Added ${socketId} to ${username}. Now has ${
        this.userConnections.get(username).length
      } connections`
    );
  }

  removeUserConnection(username: string, socketId: string): void {
    if (this.userConnections.has(username)) {
      const connections = this.userConnections.get(username);
      const index = connections.indexOf(socketId);
      if (index > -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.userConnections.delete(username);
        }
      }
      // TODO: remove this log
      logger.log(
        `Removed ${socketId} from ${username}. Now has ${connections.length} connections`
      );
    }
  }
}
