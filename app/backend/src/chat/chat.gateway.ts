import { Logger, UseGuards } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { JwtWsAuthGuard } from "../auth/guard";

const logger = new Logger("ChatGateway");

// FIXME: uncomment the following line to enable authentication
// @UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    logger.log("ChatGateway initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(
    client: Socket,
    room: { roomName: string; roomStatus: string; password?: string }
  ) {
    logger.log(
      `Received joinRoom request from ${client.id} for room ${room.roomName}: ${
        room.roomStatus
      } ${room.password ? `with password ${room.password}` : ""}`
    );
    logger.log(`Password: ${room.password}`);
    client.join(room.roomName);
    this.server
      .to(room.roomName)
      .emit("roomMessage", `User ${client.id} joined room ${room}`);
    logger.log(`User ${client.id} joined room ${room}`);
  }

  @SubscribeMessage("leaveRoom")
  async leaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.server
      .to(room)
      .emit("roomMessage", `User ${client.id} left room ${room}`);
    logger.log(`User ${client.id} left room ${room}`);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(
    client: Socket,
    { room, message }: { room: string; message: string }
  ) {
    if (!message) return;
    const user = client.id;
    this.server.to(room).emit("roomMessage", { user, room, message });
    this.server.emit("onMessage", { user, room, message }); // FIXME: temporarily broadcast to all clients, for testing purposes
    console.log(`User ${client.id} sent message in room ${room}: ${message}`);
  }
}
