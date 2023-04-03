import { Injectable, Logger } from "@nestjs/common";
import { ChatMemberRank, ChatRoomStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserConnectionsService } from "../user-connections.service";
import {
  CreateChatRoomDto,
  JoinRoomDto,
  Message,
  SendMessageDto
} from "./chat.gateway";
import { CreateChatDto } from "./dto/create-chat.dto";
import { UpdateChatDto } from "./dto/update-chat.dto";

const logger = new Logger("ChatService");

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private userConnectionsService: UserConnectionsService
  ) {}

  create(createChatDto: CreateChatDto) {
    logger.log("Created a new chat");
    return createChatDto;
  }

  /**
   * Join a chat room
   *
   * If the room doesn't exist, create it as a public room
   * If the room exists and is password protected, check the password
   *    If the password is incorrect, return an error
   * If the room exists and is public, join it
   * @param joinDto - The room name, password, and user
   * @returns - The last 50 messages in the room, or an error
   */
  async joinRoom(joinDto: JoinRoomDto): Promise<Message[] | Error> {
    const { roomName, password, user } = joinDto;
    let room = await this.prismaService.chatRoom.findUnique({
      where: { name: roomName }
    });
    if (!room) {
      try {
        room = await this.prismaService.createChatRoom({
          name: roomName,
          status: ChatRoomStatus.PUBLIC,
          owner: user
        });
        logger.log(
          `Tried to join room ${roomName}, but it did not exist. Created it as a public room: `
        );
        console.log(room);
      } catch (e) {
        logger.error(`Error creating room ${roomName}: ${e}`);
        return e;
      }
    } else if (
      room.status === ChatRoomStatus.PASSWORD &&
      room.password !== password
    ) {
      return { name: "IncorrectPasswordError", message: "Incorrect password" };
    }
    const messagesPage = await this.prismaService.message.findMany({
      where: { roomId: room.id },
      take: 50,
      include: {
        sender: {
          select: { username: true }
        },
        room: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Add the user as a chat member if they are not already a member
    const userId = await this.prismaService.getUserIdByNick(user);
    // This should really be a findUnique, but I can't figure out how to make it work
    const chatMember = await this.prismaService.chatMember.findFirst({
      where: { memberId: userId, roomId: room.id }
    });

    if (!chatMember) {
      await this.prismaService.addChatMember(
        userId,
        room.id,
        ChatMemberRank.USER
      );
    }

    return messagesPage.reverse();
  }

  /**
   * Create a new chat room.
   *
   * If the room already exists, return an error.
   * If the room does not exist, add it to the database and send a confirmation
   * @param client socket client
   * @param room CreateRoomDto
   * @returns Error or room name
   */
  async createRoom(createDto: CreateChatRoomDto): Promise<Error | string> {
    // Check if the room already exists
    const roomExists = await this.prismaService.chatRoom.findUnique({
      where: { name: createDto.name }
    });
    if (roomExists) {
      // Warn the client that the room already exists
      logger.log(`RoomCreation error: Room ${createDto.name} already exists`);
      return Error("Room already exists");
    }
    // Add the room to the database
    try {
      const ret = await this.prismaService.createChatRoom(createDto);
      // Log the room creation
      logger.log(`Room ${createDto.name} successfully added to the database: `);
      console.log(ret);
    } catch (e) {
      logger.error(e);
      return Error("Error creating room in database");
    }

    return createDto.name;
  }

  /**
   * Temporary function to create a user
   *
   * If the user already exists, return an error
   * If the user does not exist, add it to the database and send a confirmation
   * TODO: Remove this function and replace it with a proper user creation
   * @param client socket client
   * @param username
   * @returns Error or username
   */
  async createTempUser(
    clientId: string,
    username: string
  ): Promise<Error | string> {
    // Check if the user already exists
    const userExists = await this.prismaService.getUserIdByNick(username);
    if (userExists) {
      // Warn the client that the user already exists
      logger.log(`UserCreation error: User ${username} already exists`);
      return Error("User already exists");
    } else {
      // If the user does not exist, create it
      try {
        const prismaReturn = await this.prismaService.addUser({
          username,
          password: "secret"
        });
        logger.log(`User ${username} added to the database: `);
        console.log(prismaReturn);
      } catch (e) {
        logger.error(e);
        return Error("User already exists");
      }
      // Add the user connection to the UserConnections map
      this.userConnectionsService.addUserConnection(username, clientId);
      // client.emit("userCreated", username);
      return username;
    }
  }

  /**
   * Temporary function to login a user
   * If the user does not exist, return an error
   * TODO: remove this function when authentication is enabled
   * @param client socket client
   * @param username
   * @returns DevError or username
   */
  async devUserLogin(username: string): Promise<Error | string> {
    // Check if the user already exists
    const userExists = await this.prismaService.getUserIdByNick(username);
    if (!userExists) {
      // Warn the client that the user already exists
      logger.log(`UserLogin error: User ${username} does not exist`);
      return Error("User login error: user does not exist");
    }
    // FIXME: add password protection
    logger.log(`User ${username} logged in: `);
    console.log(userExists);

    return username;
  }

  async sendMessage(sendDto: SendMessageDto): Promise<Error | string> {
    if (!sendDto.content) return;

    // Try to get the room database ID
    const roomId = await this.prismaService.getChatRoomId(sendDto.roomName);
    if (!roomId) return Error("Room not found");

    // Try to get the user database ID
    const userId = await this.prismaService.getUserIdByNick(sendDto.sender);
    if (!userId) return Error("User not found");

    // Add the message to the database
    try {
      const ret = await this.prismaService.addMessageToChatRoom({
        content: sendDto.content,
        senderId: userId,
        roomId
      });
      logger.log(`Message added to the database: `);
      console.log(ret);
    } catch (e) {
      logger.error(e);
      return Error("Error adding message to database");
    }

    return sendDto.roomName;
  }
}
