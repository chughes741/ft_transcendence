import { Injectable, Logger } from "@nestjs/common";

const logger = new Logger("UserConnectionsService");

@Injectable()
export class UserConnectionsService {
  private userConnections: Map<string, string[]> = new Map();

  // Returns all of the socketIds for a given user
  getUserSockets(username: string): string[] {
    return this.userConnections.get(username);
  }

  getUserBySocket(socketId: string): string {
    const userArray = Array.from(this.userConnections.entries()).find(
      ([, connections]) => connections.includes(socketId)
    );
    return userArray ? userArray[0] : null;
  }

  addUserConnection(username: string, socketId: string): void {
    // Check if the socketId is already in use, and remove it from the old user
    const userExists = this.getUserBySocket(socketId);
    if (userExists) {
      this.userConnections
        .get(userExists)
        .splice(this.userConnections.get(userExists).indexOf(socketId), 1); // This removes the old socketId from the userConnections map
    }

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
