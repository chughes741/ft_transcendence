import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";

const logger = new Logger("UserConnectionsService");

@Injectable()
export class UserConnectionsService {
  private blockedUsers: Map<string, Set<string>> = new Map(); // Using a set to avoid duplicates, bruuuuhh
  private blockedSocketIds: Map<string, Set<string>> = new Map();
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
    logger.debug(
      `Added ${socketId} to ${username}. Now has ${
        this.getUserSockets(username).length
      } connections`
    );
    return this.getUserSockets(username).length;
  }

  removeUserConnection(username: string, socketId: string): number | Error {
    logger.log(`Removing ${socketId} from ${username}`);
    const connections = this.userConnections.get(username);
    if (!connections) {
      return Error(`User ${username} does not exist`);
    }
    if (connections) {
      const index = connections.indexOf(socketId);
      if (index > -1) {
        connections.splice(index, 1);
        if (connections.length === 0) {
          this.userConnections.delete(username);
        }
      }
      logger.debug(
        `Removed ${socketId} from ${username}. Now has ${connections.length} connections`
      );
    }
    this.blockedSocketIds.delete(socketId);
    // For performance reasons (and b/c I'm lazy), we don't delete the socketId
    // from the blockedSocketIds of the blocked users. We could. But we don't.
    logger.log(`Returning ${connections.length}`);
    return connections.length;
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

  loadBlockedSocketIds(socketId: string, username: string): void {
    if (!this.blockedUsers.has(username)) {
      logger.debug(`No blocked users for ${username}`);
      return;
    }
    if (!this.blockedSocketIds.has(socketId)) {
      this.blockedSocketIds.set(socketId, new Set());
    }
    const blockedUsers = this.blockedUsers.get(username);
    // For each blocked user, if the user has a socket, add it to the
    // blockedSocketIds of the current socket, and vice versa
    blockedUsers.forEach((blockedUser) => {
      const blockedUserSockets = this.userConnections.get(blockedUser);
      if (blockedUserSockets) {
        logger.debug(`Loading blocked user ${blockedUser} for ${username}`);
        blockedUserSockets.forEach((blockedUserSocket) => {
          this.blockedSocketIds.get(socketId).add(blockedUserSocket);
          if (!this.blockedSocketIds.has(blockedUserSocket)) {
            this.blockedSocketIds.set(blockedUserSocket, new Set());
          }
          this.blockedSocketIds.get(blockedUserSocket).add(socketId);
        });
      }
    });
  }

  getBlockedSocketIds(socketId: string): string[] {
    const blockedSocketIds = this.blockedSocketIds.get(socketId);
    return blockedSocketIds ? Array.from(blockedSocketIds) : [];
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
