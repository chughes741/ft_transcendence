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

export class CreateChatRoomDto {
  name: string;
  status: ChatRoomStatus;
  password: string;
  owner: string;
}
export class SendMessageDto {
  roomName: string;
  content: string;
  sender: string;
}

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
    // Check if the user already exists
    const userExists = await this.prismaService.nickExists(username);
    if (userExists) {
      // Warn the client that the user already exists
      client.emit("userExists");
      logger.log(`User ${username} already exists`);
    } else {
      // If the user does not exist, create it
      const prismaReturn = await this.prismaService.addUser({
        email: username,
        firstName: username,
        lastName: username,
        password: username
      });
      logger.log(`User ${username} created: `);
      console.log(prismaReturn);
      // Add the user connection to the UserConnections map
      this.userConnectionsService.addUserConnection(username, client.id);
      client.emit("userCreated", username);
    }
  }

  /**
   * Create a new chat room
   * @param client socket client
   * @param room CreateRoomDto
   */
  @SubscribeMessage("createRoom")
  async createRoom(client: Socket, createDto: CreateChatRoomDto) {
    logger.log(
      `Received createRoom request from ${createDto.owner} for room ${
        createDto.name
      }: ${createDto.status} ${
        createDto.password ? `with password ${createDto.password}` : ""
      }`
    );
    // Add the user to the socket room
    client.join(createDto.name);
    logger.log(`User ${createDto.owner} joined socket room ${createDto.name}`);
    console.log(createDto);

    // Add the room to the database
    const ret = await this.prismaService.createChatRoom(createDto);
    logger.log(`Room ${createDto.name} created: `);
    console.log(ret);

    // Send a confirmation message to all clients in the room
    this.server
      .to(createDto.name)
      .emit(
        "roomMessage",
        `User ${createDto.owner} CREATED room ${createDto.name}`
      );

    logger.log(`User ${createDto.owner} CREATED room ${createDto.name}`);
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

  /**
   * Leave a chat room
   * @param client client socket
   * @param room name of the room to leave
   */
  @SubscribeMessage("leaveRoom")
  async leaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.server
      .to(room)
      .emit("roomMessage", `User ${client.id} left room ${room}`);
    logger.log(`User ${client.id} left room ${room}`);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(client: Socket, sendDto: SendMessageDto) {
    if (!sendDto.content) return;
    this.server.to(sendDto.roomName).emit("roomMessage", {
      sender: sendDto.sender,
      roomName: sendDto.roomName,
      content: sendDto.content
    });
    this.server.emit("onMessage", {
      sender: sendDto.sender,
      roomName: sendDto.roomName,
      content: sendDto.content
    }); // FIXME: temporarily broadcast to all clients, for testing purposes
    logger.log(
      `User ${sendDto.sender} sent message in room ${sendDto.roomName}: ${sendDto.content}`
    );

    // Try to get the room database ID
    const roomId = await this.prismaService.getChatRoomId(sendDto.roomName);
    logger.log(`Room name: ${sendDto.roomName} has a room ID: ${roomId}`);

    // Try to get the user database ID
    const userId = await this.prismaService.nickExists(sendDto.sender);
    logger.log(`User name: ${sendDto.sender} has a user ID: ${userId}`);

    // Add the message to the database
    const ret = await this.prismaService.addMessageToChatRoom({
      content: sendDto.content,
      senderId: userId,
      roomId
    });
    logger.log(`Message added to the database: `);
    console.log(ret);
  }
}
