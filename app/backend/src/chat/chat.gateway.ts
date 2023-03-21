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
import { PrismaService } from "../prisma/prisma.service";
import { ChatMemberStatus, ChatRoomStatus } from "@prisma/client";
import { ChatRoomDto } from "../auth/dto/prisma.dto";
import { UserConnectionsService } from "../user-connections.service";

const logger = new Logger("ChatGateway");

// FIXME: uncomment the following line to enable authentication
// @UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private prismaService: PrismaService,
    private userConnectionsService: UserConnectionsService
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    logger.log("ChatGateway initialized");
  }
  // FIXME: temporary code to create a user for each client
  // TODO: remove this code when authentication is enabled
  async handleConnection(client: Socket, ...args: any[]) {
    logger.log(`Client connected: ${client.id}`);

    // Add the user connection
    this.userConnectionsService.addUserConnection(client.id, client.id);
  }

  handleDisconnect(client: Socket) {
    // Remove the user connection
    this.userConnectionsService.removeUserConnection(client.id, client.id);

    logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("createUser")
  async createTempUser(client: Socket, username: string) {
    logger.log(
      `Received createUser request from ${client.id} for user ${username}`
    );
    const userExists = await this.prismaService.nickExists(username);
    if (userExists) {
      client.emit("userExists");
      logger.log(`User ${username} already exists`);
    } else {
      const prismaReturn = await this.prismaService.addUser({
        email: username,
        firstName: username,
        lastName: username,
        password: username
      });
      logger.log(`User ${username} created: `);
      console.log(prismaReturn);
      this.userConnectionsService.addUserConnection(username, client.id);
      client.emit("userCreated", username);
    }
  }
  @SubscribeMessage("createRoom")
  async createRoom(
    client: Socket,
    room: {
      roomName: string;
      roomStatus: string;
      password: string;
      owner: string;
    }
  ) {
    logger.log(
      `Received createRoom request from ${room.owner} for room ${
        room.roomName
      }: ${room.roomStatus} ${
        room.password ? `with password ${room.password}` : ""
      }`
    );
    client.join(room.roomName);
    logger.log(`User ${room.owner} joined socket room ${room.roomName}`);
    const dto: ChatRoomDto = {
      name: room.roomName,
      status: ChatRoomStatus[room.roomStatus],
      password: room.password,
      owner: room.owner
    };
    const ret = await this.prismaService.createChatRoom(dto);
    logger.log(`Room ${room.roomName} created: `);
    console.log(ret);

    this.server
      .to(room.roomName)
      .emit("roomMessage", `User ${room.owner} CREATED room ${room.roomName}`);

    logger.log(`User ${room.owner} CREATED room ${room.roomName}`);
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(
    client: Socket,
    room: { roomName: string; password?: string; user: string }
  ) {
    logger.log(
      `Received joinRoom request from ${room.user} for room ${room.roomName} ${
        room.password ? `: with password ${room.password}` : ""
      }`
    );
    client.join(room.roomName);
    this.server
      .to(room.roomName)
      .emit("roomMessage", `User ${room.user} joined room ${room.roomName}`);
    logger.log(`User ${room.user} joined room ${room.roomName}`);
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
