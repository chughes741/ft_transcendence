import { Injectable, Logger } from "@nestjs/common";
import { ChatMemberRank, ChatRoomStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserConnectionsService } from "../user-connections.service";
import {
  ChatRoomEntity,
  CreateChatRoomDto,
  JoinRoomDto,
  SendMessageDto
} from "./chat.gateway";
import { CreateChatDto } from "./dto/create-chat.dto";
import { MessageEntity } from "./entities/message.entity";
import { kickMemberDto, updateChatMemberStatusDto } from "./dto/userlist.dto";
import { ChatMemberPrismaType, ChatMemberEntity } from "./chat.gateway";
import { error } from "console";

const logger = new Logger("ChatService");

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private userConnectionsService: UserConnectionsService
  ) { }

  create(createChatDto: CreateChatDto) {
    logger.log("Created a new chat");
    return createChatDto;
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
  async createRoom(
    createDto: CreateChatRoomDto
  ): Promise<ChatRoomEntity | Error> {
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
      const room = await this.prismaService.createChatRoom(createDto);
      logger.log(`Room ${createDto.name} successfully added to the database: `);
      console.log(room);
      return {
        name: room.name,
        queryingUserRank: ChatMemberRank.OWNER,
        status: room.status,
        latestMessage: null,
        lastActivity: room.createdAt
      };
    } catch (e) {
      logger.error(e);
      return Error("Error creating room in database");
    }
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
  async joinRoom(joinDto: JoinRoomDto): Promise<ChatRoomEntity | Error> {
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
      return Error("Incorrect password");
    }

    // Add the user as a chat member if they are not already a member
    const userId = await this.prismaService.getUserIdByNick(user);
    // This should really be a findUnique, but I can't figure out how to make it work
    let chatMember = await this.prismaService.chatMember.findFirst({
      where: { memberId: userId, roomId: room.id }
    });
    if (!chatMember) {
      chatMember = await this.prismaService.addChatMember(
        userId,
        room.id,
        ChatMemberRank.USER
      );
    }

    const latestMessage = await this.prismaService.getLatestMessage(room.id);
    const lastActivity = latestMessage
      ? latestMessage.createdAt
      : room.createdAt;
    const roomMembers = await this.prismaService.getRoomMembers(room.name);
    const avatars = roomMembers.map((member) =>
      member.member.avatar === "default_avatar.png"
        ? `https://i.pravatar.cc/150?u=${member.member.username}`
        : member.member.avatar
    );

    return {
      name: room.name,
      queryingUserRank: chatMember.rank,
      status: room.status,
      latestMessage: latestMessage ? new MessageEntity(latestMessage) : null,
      lastActivity: lastActivity,
      avatars
    };
  }

  /**
   * get a page of messages from a room
   * @param roomName - The name of the room
   * @param date - The date to start from
   * @param pageSize - The number of messages to return
   * @returns - An array of messages from oldest to newest, or an error
   */
  async getRoomMessagesPage(
    roomName: string,
    date: Date,
    pageSize: number
  ): Promise<MessageEntity[]> {
    const roomId = await this.prismaService.getChatRoomId(roomName);
    if (!roomId) {
      throw new Error("Room not found");
    }
    const messagesPage = (
      await this.prismaService.getChatMessagesPage(roomId, date, pageSize)
    ).reverse();
    return messagesPage.map((message) => new MessageEntity(message));
  }

  /**
   * Send a message to a chat room.
   *
   * If the room does not exist, return an error.
   * If the message is successfully added to the database, return the room name
   *
   * @param client
   * @param sendDto
   * @returns
   */
  async sendMessage(sendDto: SendMessageDto): Promise<Error | MessageEntity> {
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
      return new MessageEntity(ret);
    } catch (e) {
      logger.error(e);
      return Error("Error adding message to database");
    }
  }

  /*****************************************/
  /* Dev Signin Functions - To Be Removed  */
  /*****************************************/

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


  /*
    GET USER LIST : Get all user information relevant for the chat user tab Component
    Takes a ChatmemberPrismaType array and transforms it into a ChatMemberEntity[], expected by the client
  */
  async getUserList(chatRoomName: string): Promise<ChatMemberEntity[]> {
    console.log("Inside getUserList");


    //get all users that are members of a specific Chat Room (with string name)
    const userMembers: ChatMemberPrismaType[] = await this.prismaService.getRoomMembers(chatRoomName);
    const CMEntities: ChatMemberEntity[] = userMembers.map((chatMembers) => {
      return {
        username: chatMembers.member.username,
        id: chatMembers.id,
        chatMemberstatus: chatMembers.status,
        userStatus: chatMembers.member.status,
        rank: chatMembers.rank,
        endOfBan: chatMembers.endOfBan,
        endOfMute: chatMembers.endOfMute,
        email: chatMembers.member.email,
        avatar: chatMembers.member.avatar,
      }
    })
    if (userMembers.length > 0) {
      return CMEntities
    }
    console.log("There is no members in room");
    return [];
  }

  async updateStatus(updateDto: updateChatMemberStatusDto) {
    try {
      //MANAGES INVALID INPUTS:
      if (updateDto.memberRequestRank === ChatMemberRank.USER)
        throw new Error("Wrong rank: Can't request operation");
      if (updateDto.memberRequestRank === ChatMemberRank.DISCONNECTED)
        throw new Error("You are disconnected: Can't request operation");
      if (updateDto.memberToUpdateRANK === ChatMemberRank.OWNER)
        throw new Error("ALARM: Trying to modify the owner's status, this activity will be reported !");
      
      //TRIES TO UPDATE STATUS with Prisma and returns if successful response
      const response = await this.prismaService.updateChatMemberStatus(updateDto);
      return response;
   
    } catch (error) { //RETURNS ERROR from any Error message
      console.error(error);
      throw error;
    }
  }

  async kickMember(kickDto: kickMemberDto): Promise<string> {

    const ChatMember = await this.prismaService.getChatMember(kickDto.ChatMemberToKickId);

    if (kickDto.memberRequestingRank === ChatMemberRank.USER || kickDto.memberRequestingRank === ChatMemberRank.DISCONNECTED
      || kickDto.memberToKickStatus === ChatMemberRank.OWNER)
       throw new Error("Wrong rank: Can't request operation");
    if (kickDto.memberToKickStatus === ChatMemberRank.ADMIN && kickDto.memberRequestingRank === ChatMemberRank.ADMIN)
       throw new Error("Wrong rank: Can't request operation");
    this.prismaService.destroyChatMember(kickDto.ChatMemberToKickId);
    return "Chat Member " + kickDto.ChatMemberToKickName + " kicked out successfully !";
  }


}
