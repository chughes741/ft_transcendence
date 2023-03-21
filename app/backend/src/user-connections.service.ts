// [app/backend/src/chat/user-connections.service.ts]

import { Injectable } from "@nestjs/common";

@Injectable()
export class UserConnectionsService {
  private userConnections: Map<string, string[]> = new Map();

  addUserConnection(username: string, socketId: string): void {
    if (!this.userConnections.has(username)) {
      this.userConnections.set(username, []);
    }
    this.userConnections.get(username).push(socketId);
    console.log(this.userConnections);
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
    }
  }
}
