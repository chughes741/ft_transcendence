import { Injectable, Logger } from "@nestjs/common";
import { ChatRoomStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserConnectionsService } from "../user-connections.service";
import { CreateChatRoomDto, JoinRoomDto, Message } from "./chat.gateway";
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
    const room = await this.prismaService.chatRoom.findUnique({
      where: { name: roomName }
    });

    // TODO:
    // 1. Check if the user is already in the room
    // 2. Check if the user is banned from the room
    // 3. Check if the room is full

    if (!room) {
      // Room doesn't exist, create it as a public room
      await this.prismaService.createChatRoom({
        name: roomName,
        status: ChatRoomStatus.PUBLIC,
        owner: user
      });
    } else if (
      room.status === ChatRoomStatus.PASSWORD &&
      room.password !== password
    ) {
      return { name: "IncorrectPasswordError", message: "Incorrect password" };
    }

    // Fetch last 50 messages and send them to the user
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

    // Order the messages from oldest to newest and send them to the user
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

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
