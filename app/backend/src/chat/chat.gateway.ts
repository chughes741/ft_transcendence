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
    this.joinRoom(client, client.id);
  }

  handleDisconnect(client: Socket) {
    logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(client: Socket, room: string) {
    client.join(room);
    this.server
      .to(room)
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

  @SubscribeMessage("newMessage")
  @SubscribeMessage("sendMessage")
  async sendMessage(
    client: Socket,
    { room, message }: { room: string; message: string }
  ) {
    const user = client.id;
    this.server.to(room).emit("roomMessage", { user, room, message });
    this.server.emit("onMessage", { user, room, message });
    console.log(`User ${client.id} sent message in room ${room}: ${message}`);
  }
}
