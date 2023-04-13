import * as argon2 from "argon2";
import { Injectable, Logger } from "@nestjs/common";
import {
  ChatMember,
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoom,
  ChatRoomStatus,
  User
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserConnectionsService } from "../user-connections.service";
import {
  ChatRoomEntity,
  CreateChatRoomDto,
  InviteUsersToRoomRequest,
  JoinRoomDto,
  LeaveRoomRequest,
  SendMessageDto,
  UpdateChatRoomRequest
} from "./chat.gateway";
import { MessageEntity } from "./entities/message.entity";
import { kickMemberDto, updateChatMemberStatusDto } from "./dto/userlist.dto";
import { ChatMemberEntity } from "./entities/message.entity";

const logger = new Logger("ChatService");

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private userConnectionsService: UserConnectionsService
  ) {}

  async getChatRoomEntity(
    room: ChatRoom,
    queryingMemberRank: ChatMemberRank
  ): Promise<ChatRoomEntity | Error> {
    const latestMessage = await this.prismaService.getLatestMessage(room.id);
    const lastActivity = latestMessage
      ? latestMessage.createdAt
      : room.createdAt;
    const roomMembers = await this.prismaService.getRoomMembers(room.name);
    // FIXME: remove avatars?
    const avatars = roomMembers.map((member) =>
      member.member.avatar === "default_avatar.png"
        ? `https://i.pravatar.cc/150?u=${member.member.username}`
        : member.member.avatar
    );

    return {
      name: room.name,
      queryingUserRank: queryingMemberRank,
      status: room.status,
      latestMessage: latestMessage ? new MessageEntity(latestMessage) : null,
      lastActivity: lastActivity,
      avatars,
      members: roomMembers.map((member) => new ChatMemberEntity(member))
    };
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
    try {
      // Check if the room already exists
      const roomExists = await this.prismaService.chatRoom.findUnique({
        where: { name: createDto.name }
      });
      if (roomExists) {
        // Warn the client that the room already exists
        logger.log(`RoomCreation error: Room ${createDto.name} already exists`);
        return Error("Room already exists");
      }
    } catch (e) {
      logger.error("Error checking if room exists", e);
      return Error("Error checking if room exists");
    }

    // Add the room to the database
    try {
      const room = await this.prismaService.createChatRoom(createDto);
      logger.log(`Room ${createDto.name} successfully added to the database: `);
      console.log(room);
      const members = await this.prismaService.getRoomMembers(room.name);
      return {
        name: room.name,
        queryingUserRank: ChatMemberRank.OWNER,
        status: room.status,
        latestMessage: null,
        lastActivity: room.createdAt,
        members: members.map((member) => new ChatMemberEntity(member)),
        avatars: [members[0].member.avatar]
      };
    } catch (e) {
      logger.error("Error creating room in database", e);
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
    let room: ChatRoom;
    try {
      room = await this.prismaService.chatRoom.findUnique({
        where: { name: roomName }
      });
    } catch (e) {
      // FIXME: Remove this behaviour after development is complete
      logger.error(
        `Error finding room ${roomName}: ${e.message}, attempting to create it`
      );
      try {
        room = await this.prismaService.createChatRoom({
          name: roomName,
          status: ChatRoomStatus.PUBLIC,
          owner: user
        });
        logger.log(`Room ${roomName} created: `);
        console.log(room);
      } catch (e) {
        logger.error(`Error creating room ${roomName}: ${e}`);
        return e;
      }
    }

    if (room.status === ChatRoomStatus.PASSWORD && room.password !== password) {
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

    return this.getChatRoomEntity(room, chatMember.rank);
  }

  async leaveRoom(req: LeaveRoomRequest): Promise<ChatMember | Error> {
    const userId = await this.prismaService.getUserIdByNick(req.username);
    logger.log(`User ${req.username} is leaving room ${req.roomName}`);
    const roomId = await this.prismaService.getChatRoomId(req.roomName);
    if (!roomId) {
      return Error("Room not found");
    }
    const chatMember = await this.prismaService.chatMember.findFirst({
      where: { memberId: userId, roomId: roomId }
    });
    if (!chatMember) {
      return Error("User is not a member of this room");
    }
    return this.prismaService.chatMember.delete({
      where: { id: chatMember.id }
    });
  }

  /**
   * Update a Chat Room
   * @param updateDto - The room name, password, and user
   * @returns - The updated room, or an error
   */
  async updateRoom(
    req: UpdateChatRoomRequest
  ): Promise<ChatRoomEntity | Error> {
    try {
      const { roomName, status, username, oldPassword } = req;
      let { newPassword } = req;

      const roomWithMember = await this.prismaService.getChatRoomWithMember(
        roomName,
        username
      );

      if (!roomWithMember) {
        return Error("Room not found");
      }

      const { room, chatMember } = roomWithMember;

      if (!chatMember || chatMember.rank !== ChatMemberRank.OWNER) {
        return Error("User is not allowed to update this room");
      }

      if (room.status === ChatRoomStatus.PASSWORD) {
        if (!oldPassword) {
          return Error("Old password is required");
        }
        const passwordMatch = await argon2.verify(room.password, oldPassword);
        if (!passwordMatch) {
          return Error("Old password is incorrect");
        }
      }
      logger.warn(`Previous status was ${room.status}`);
      logger.log(`Updating room ${roomName} to status ${status}`);

      if (status === ChatRoomStatus.PASSWORD) {
        if (!newPassword) {
          const err = `Error, no password provided for password protected room`;
          logger.error(err);
          return Error(err);
        }
        newPassword = await argon2.hash(newPassword);
      }

      const updatedRoom = await this.prismaService.updateChatRoom(room.id, {
        roomName,
        newPassword,
        status
      });
      return this.getChatRoomEntity(updatedRoom, chatMember.rank);
    } catch (e) {
      logger.error("Error updating room", e);
      return Error("Error updating room");
    }
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
      logger.error("Error adding message to database", e);
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
          password: "secret",
          avatar: `https://i.pravatar.cc/150?u=${username}`
        });
        logger.log(`User ${username} added to the database: `);
        console.log(prismaReturn);
      } catch (e) {
        logger.error("User already exists", "User already exists", e);
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

  /**
   * Get the list of users in a chat room
   * If the room does not exist, return an error
   * @param chatRoomName - The name of the chat room
   * @returns ChatMemberEntity[] - An array of ChatMemberEntities
   */
  async getUserList(chatRoomName: string): Promise<ChatMemberEntity[]> {
    try {
      const roomMembers: ChatMemberEntity[] = (
        await this.prismaService.getRoomMembers(chatRoomName)
      ).map((chatMember) => new ChatMemberEntity(chatMember));
      return roomMembers;
    } catch (error) {
      logger.error("Error getting user list", error);
      return [];
    }
  }

  /**
   * Update the status of a chat member
   * If the member to update is the owner, return an error
   * If the member requesting the update is a user, return an error
   * @param updateDto - The updateChatMemberStatusDto object
   * @returns ChatMember - The updated ChatMember object
   */
  async updateMemberStatus(
    updateDto: updateChatMemberStatusDto
  ): Promise<ChatMember> {
    try {
      if (
        updateDto.memberToUpdateRANK === ChatMemberRank.OWNER ||
        updateDto.memberRequestRank === ChatMemberRank.USER
      ) {
        const error =
          updateDto.memberRequestRank === ChatMemberRank.USER
            ? "Wrong rank: Can't request operation"
            : "Wrong rank: Can't update owner";
        logger.error("Error updating chat member status", error);
        throw new Error(error);
      }
      const response = await this.prismaService.updateChatMemberStatus(
        updateDto
      );
      return response;
    } catch (error) {
      logger.error("Error updating chat member status", error);
      throw error;
    }
  }

  async kickMember(kickDto: kickMemberDto): Promise<string> {
    if (
      kickDto.memberRequestingRank === ChatMemberRank.USER ||
      kickDto.memberToKickStatus === ChatMemberRank.OWNER
    )
      throw new Error("Wrong rank: Can't request operation");
    if (
      kickDto.memberToKickStatus === ChatMemberRank.ADMIN &&
      kickDto.memberRequestingRank === ChatMemberRank.ADMIN
    )
      throw new Error("Wrong rank: Can't request operation");
    this.prismaService.destroyChatMember(kickDto.ChatMemberToKickId);
    return (
      "Chat Member " +
      kickDto.ChatMemberToKickName +
      " kicked out successfully !"
    );
  }

  // inviteUsersToRoom takes in a InviteUsersToRoomRequest and returns a ChatMemberEntity[] if successful
  async inviteUsersToRoom(
    req: InviteUsersToRoomRequest
  ): Promise<ChatMemberEntity[] | Error> {
    // Do this in a try/catch block to catch Prisma errors
    const roomId = await this.prismaService.getChatRoomId(req.roomName);
    const invitedUsers: User[] = [];
    for (const username of req.usernames) {
      try {
        const invitedUser = await this.prismaService.user.findUnique({
          where: { username }
        });
        // Add the user to the database as a ChatMember
        this.prismaService.addChatMember(
          invitedUser.id,
          roomId,
          ChatMemberRank.USER
        );
        invitedUsers.push(invitedUser);
      } catch (e) {
        logger.log(`Error adding user ${username}`, e);
      }
    }
    logger.log("After the try/catch, Invited users:");
    console.log(invitedUsers);
    return invitedUsers.map((user) => {
      return {
        username: user.username,
        roomName: req.roomName,
        avatar: user.avatar,
        chatMemberstatus: ChatMemberStatus.OK,
        userStatus: user.status,
        rank: ChatMemberRank.USER
      };
    });
  }
}
