import { Injectable, Logger } from "@nestjs/common";

const logger = new Logger("UserConnectionsService");

@Injectable()
export class UserConnectionsService {
  private blockedUsers: Map<string, Set<string>> = new Map(); // Using a set to avoid duplicates, bruuuuhh
  private userConnections: Map<string, string[]> = new Map(); // Not here doe, UUIDs take care of it!
  getUserSockets(username: string): string[] {
    return this.userConnections.get(username) || [];
  }

  getUserBySocket(socketId: string): string {
    const userArray = Array.from(this.userConnections.entries()).find(
      ([, connections]) => connections.includes(socketId)
    );
    return userArray ? userArray[0] : null;
  }

  addUserConnection(username: string, socketId: string): number {
    // Check if the socketId is already in use, and remove it from the old user
    const userExists = this.getUserBySocket(socketId);
    if (userExists) {
      const oldConnections = this.userConnections.get(userExists);
      if (oldConnections) {
        const index = oldConnections.indexOf(socketId);
        if (index > -1) {
          oldConnections.splice(index, 1);
        }
      }
    }

    if (!this.userConnections.has(username)) {
      this.userConnections.set(username, []);
    }
    this.userConnections.get(username).push(socketId);
    logger.log(
      `Added ${socketId} to ${username}. Now has ${
        this.getUserSockets(username).length
      } connections`
    );
    return this.getUserSockets(username).length;
  }

  removeUserConnection(username: string, socketId: string): number | string {
    const connections = this.userConnections.get(username);
    if (connections) {
      const index = connections.indexOf(socketId);
      if (index > -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.userConnections.delete(username);
        }
      }
      logger.log(
        `Removed ${socketId} from ${username}. Now has ${connections.length} connections`
      );
    }
    return connections && connections.length ? connections.length : username;
  }

  userIsBlockedBy(blockedUsername: string, blockingUsername: string): boolean {
    const blockingList = this.blockedUsers.get(blockingUsername);
    return blockingList ? blockingList.has(blockedUsername) : false;
  }

  userIsBlocking(blockingUsername: string, blockedUsername: string): boolean {
    return this.userIsBlockedBy(blockedUsername, blockingUsername);
  }

  addUserToBlocked(blockingUsername: string, blockedUsername: string): void {
    if (!this.blockedUsers.has(blockingUsername)) {
      this.blockedUsers.set(blockingUsername, new Set());
    }
    this.blockedUsers.get(blockingUsername).add(blockedUsername);
  }

  removeUserFromBlocked(
    blockingUsername: string,
    blockedUsername: string
  ): void {
    const blockedList = this.blockedUsers.get(blockingUsername);
    if (blockedList) {
      blockedList.delete(blockedUsername);
      if (blockedList.size === 0) {
        this.blockedUsers.delete(blockingUsername);
      }
    }
  }

  getBlockedUsers(blockingUsername: string): string[] {
    const blockedList = this.blockedUsers.get(blockingUsername);
    return blockedList ? Array.from(blockedList) : [];
  }

  removeUserEntries(username: string): void {
    this.userConnections.delete(username);
    this.blockedUsers.delete(username);
  }
}
