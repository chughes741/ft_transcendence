import * as argon2 from "argon2";
import { Injectable, Logger } from "@nestjs/common";
import {
  User,
  ChatMember,
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoom,
  ChatRoomStatus,
  UserStatus,
  BlockedUser
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MessageEntity } from "./entities/message.entity";
import { KickMemberRequest, UpdateChatMemberRequest } from "./dto/userlist.dto";
import { ChatMemberEntity } from "./entities/message.entity";
import { AuthRequest, UserEntity } from "../auth/dto";
import {
  ChatRoomEntity,
  CreateChatRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  UpdateChatRoomRequest,
  SendMessageRequest,
  ChatMemberPrismaType,
  InviteUsersToRoomRequest,
  SendDirectMessageRequest,
  BlockUserRequest
} from "./chat.types";

const logger = new Logger("ChatService");

/**
 * Chat service
 */
@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async getChatRoomEntity(
    room: ChatRoom,
    queryingMemberRank: ChatMemberRank
  ): Promise<ChatRoomEntity | Error> {
    const latestMessage = await this.prismaService.getLatestMessage(room.id);
    const lastActivity = latestMessage
      ? latestMessage.createdAt
      : room.createdAt;
    const roomMembers = await this.prismaService.getRoomMembers(room.name);
    const avatars = roomMembers.map((member) => member.member.avatar);

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
   * message to the client.
   *
   * @param createDto - The room name, status, and password
   * @returns {Promise<ChatRoomEntity | Error>} - The room entity or an error
   */
  async createRoom(
    createDto: CreateChatRoomRequest
  ): Promise<ChatRoomEntity | Error> {
    try {
      // Check if the room already exists
      const roomExists = await this.prismaService.chatRoom.findUnique({
        where: { name: createDto.name }
      });
      if (roomExists) {
        // Warn the client that the room already exists
        logger.error(
          `RoomCreation error: Room ${createDto.name} already exists`
        );
        return Error("Room already exists");
      }
    } catch (e) {
      logger.error("Error checking if room exists", e);
      return Error("Error checking if room exists");
    }

    // Add the room to the database
    try {
      if (createDto.status === ChatRoomStatus.PASSWORD)
        createDto.password = await argon2.hash(createDto.password);
      const room = await this.prismaService.createChatRoom(createDto);
      logger.debug(`Room ${createDto.name} successfully added to the database`);
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
   * Checks if date is in the past
   *
   * @param {Date} date - The date to check
   * @returns {boolean} - True if date is in the past, false otherwise
   */
  private isPast(date: Date): boolean {
    const now = new Date();
    return date.getTime() < now.getTime();
  }

  /**
   * Handles the creation of a new chat room
   *
   * @param {string} roomName - The name of the room to create
   * @param {string} user - The user creating the room
   * @returns {Promise<ChatRoom>} - The created room
   */
  private async handleRoomCreation(
    roomName: string,
    user: string
  ): Promise<ChatRoom> {
    const createRoomReq: CreateChatRoomRequest = {
      name: roomName,
      status: ChatRoomStatus.PUBLIC,
      password: null,
      owner: user
    };

    try {
      const room = await this.prismaService.createChatRoom(createRoomReq);
      return room;
    } catch (e) {
      logger.error(`Error creating room ${roomName}`, e);
      throw Error(`Error creating room ${roomName}`);
    }
  }

  /**
   * Handles password verification for a room
   *
   * @param {ChatRoom} room - The room to verify
   * @param {string} password - The password to verify
   * @returns {Promise<void>} - Resolves if password is correct, rejects otherwise
   */
  private async handlePasswordVerification(
    room: ChatRoom,
    password: string
  ): Promise<void> {
    if (room.status === ChatRoomStatus.PASSWORD) {
      const isPasswordCorrect = await argon2.verify(room.password, password);
      if (!isPasswordCorrect) {
        throw Error("Incorrect password");
      }
    }
  }

  /**
   * Handles chat member creation
   *
   * @param {string} user - The user to create
   * @param {number} roomId - The room to add the user to
   * @returns {Promise<ChatMember>} - The created chat member
   */
  private async handleChatMember(
    user: string,
    roomId: number
  ): Promise<ChatMember> {
    const userId = await this.prismaService.getUserIdByNick(user);
    if (!userId) {
      throw Error(`User ${user} does not exist`);
    }
    let chatMember = await this.prismaService.chatMember.findFirst({
      where: { memberId: userId, roomId: roomId }
    });

    if (!chatMember) {
      chatMember = await this.prismaService.addChatMember(
        userId,
        roomId,
        ChatMemberRank.USER
      );
    }

    return chatMember;
  }

  /**
   * Join a chat room
   *
   * If the room doesn't exist, create it as a public room
   * If the room exists and is password protected, check the password
   *    If the password is incorrect, return an error
   * If the room exists and is public, join it
   *
   * @param {JoinRoomRequest} joinDto - The room name, password, and user
   * @returns {Promise<ChatRoomEntity | Error>} - The room entity or an error
   */
  async joinRoom(joinDto: JoinRoomRequest): Promise<ChatRoomEntity | Error> {
    const { roomName, password, user } = joinDto;
    logger.debug(`User ${user} attempting to join room ${roomName}`);

    let room: ChatRoom;

    try {
      room = await this.prismaService.chatRoom.findUnique({
        where: { name: roomName }
      });

      if (!room) {
        room = await this.handleRoomCreation(roomName, user);
      }
    } catch (e) {
      room = await this.handleRoomCreation(roomName, user);
    }

    try {
      await this.handlePasswordVerification(room, password);
    } catch (e) {
      logger.error(`Error verifying password for room ${roomName}`, e);
      return Error(`Error verifying password for room ${roomName}`);
    }

    let chatMember: ChatMember;

    try {
      chatMember = await this.handleChatMember(user, room.id);

      // Check if the user is banned and the ban has not expired
      if (chatMember.endOfBan && !this.isPast(chatMember.endOfBan)) {
        throw Error("You are banned from this room.");
      }
    } catch (e) {
      logger.error(`Error handling chat member for room ${roomName}`, e);
      return Error(e.message);
    }

    return this.getChatRoomEntity(room, chatMember.rank);
  }

  /**
   * Leave a chat room
   *
   * @param {LeaveRoomRequest} req - The room name and username
   * @returns {Promise<ChatMember | Error>} - The chat member or an error
   */
  async leaveRoom(req: LeaveRoomRequest): Promise<ChatMember | Error> {
    try {
      const userId = await this.prismaService.getUserIdByNick(req.username);
      logger.debug(`User ${req.username} is leaving room ${req.roomName}`);
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
    } catch (e) {
      logger.error("Error leaving room", e);
      return Error("Error leaving room: " + e.message);
    }
  }

  /**
   * Update a Chat Room
   *
   * @param {UpdateChatRoomRequest} req - The room name, status, username, old password, and new password
   * @returns {Promise<ChatRoomEntity | Error>} - The updated room or an error
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
      logger.debug(`Previous status was ${room.status}`);
      logger.debug(`Updating room ${roomName} to status ${status}`);

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
   *
   * @param {string} roomName - The room name
   * @param {Date} date - The date to start the page from
   * @param {number} pageSize - The number of messages to return
   * @returns {Promise<MessageEntity[]>} - The messages
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
   * @param {SendMessageRequest} sendDto - The message to send
   * @returns {Promise<Error | MessageEntity>} - The message or an error
   */
  async sendMessage(
    sendDto: SendMessageRequest
  ): Promise<Error | MessageEntity> {
    if (!sendDto.content) return;

    // Try to get the user database ID
    const userId = await this.prismaService.getUserIdByNick(sendDto.sender);
    if (!userId) return Error("User not found");

    // Try to get the room database ID
    const roomId = await this.prismaService.getChatRoomId(sendDto.roomName);
    if (!roomId) return Error("Room not found");

    // Check and update the user's status
    const userStatus = await this.checkAndUpdateUserStatus(
      userId,
      sendDto.roomName
    );

    // If the user is muted or banned, do not allow them to send a message
    if (
      userStatus === ChatMemberStatus.MUTED ||
      userStatus === ChatMemberStatus.BANNED
    ) {
      return Error("User is muted or banned");
    }

    // Add the message to the database
    try {
      const ret = await this.prismaService.addMessageToChatRoom({
        content: sendDto.content,
        senderId: userId,
        roomId
      });
      logger.debug(`Message added to the database: `, ret);
      return new MessageEntity(ret);
    } catch (e) {
      logger.error("Error adding message to database", e);
      return Error("Error adding message to database");
    }
  }

  /**
   * Temporary function to login a user
   *
   * If the user does not exist, return an error
   * @todo remove this function when authentication is enabled
   *
   * @param {AuthRequest} req - The user's username
   * @returns {Promise<string | Error>} - The username or an error
   */
  async devUserLogin(req: AuthRequest): Promise<Error | string> {
    // Check if the user already exists
    const username = req.username;
    const userExists = await this.prismaService.getUserIdByNick(username);
    if (!userExists) {
      // Warn the client that the user already exists
      logger.error(`UserLogin error: User ${username} does not exist`);
      return Error("User login error: user does not exist");
    }
    /** @todo add password protection */
    logger.debug(`User ${username} logged in: `, userExists);

    return username;
  }

  /**
   * Get the list of users in a chat room
   *
   * If the room does not exist, return an error
   *
   * @param {string} chatRoomName - The name of the chat room
   * @returns {Promise<ChatMemberEntity[]>} - The list of users in the chat room
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
   * Check and update the user's status
   *
   * If the user is muted and the mute has expired, update the user's status to OK
   *
   * @param {string} uuid - The user's UUID
   * @param {string} roomName - The name of the chat room
   * @returns {Promise<ChatMemberStatus>} - The user's status
   */
  async checkAndUpdateUserStatus(
    uuid: string,
    roomName: string
  ): Promise<ChatMemberStatus> {
    const userStatus = await this.prismaService.checkChatMemberStatus(
      uuid,
      roomName
    );

    if (
      userStatus.status === ChatMemberStatus.MUTED &&
      userStatus.expiration &&
      userStatus.expiration < new Date()
    ) {
      const updatedStatus = ChatMemberStatus.OK;
      const usernameToUpdate = await this.prismaService.getChatMemberByUUID(
        roomName,
        uuid
      );
      try {
        const updateData: Partial<ChatMember> = {
          status: updatedStatus,
          rank: usernameToUpdate.rank,
          endOfMute: null
        };
        await this.prismaService.chatMember.update({
          where: { id: usernameToUpdate.id },
          data: updateData
        });
        return updatedStatus;
      } catch (e) {
        logger.error("Error updating chat member status", e);
        return userStatus.status;
      }
    }

    return userStatus.status;
  }

  /**
   * Update the status of a chat member
   *
   * If the member to update is the owner, return an error
   * If the member requesting the update is a user, return an error
   *
   * @param {UpdateChatMemberRequest} updateDto - The member to update, the member requesting the update, and the new status
   * @returns {Promise<ChatMemberPrismaType>} - The updated chat member
   */
  async updateMemberStatus(
    updateDto: UpdateChatMemberRequest
  ): Promise<ChatMemberPrismaType> {
    try {
      if (
        updateDto.memberToUpdateRank === ChatMemberRank.OWNER ||
        updateDto.queryingMemberRank === ChatMemberRank.USER
      ) {
        const error =
          updateDto.queryingMemberRank === ChatMemberRank.USER
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

  /**
   * Kick a chat member
   *
   * If the member to kick is the owner, return an error
   * If the member requesting the kick is a user, return an error
   *
   * @param {KickMemberRequest} kickDto - The member to kick, the member requesting the kick, and the new status
   * @returns {Promise<ChatMemberEntity | Error>} - The updated chat member
   */
  async kickMember(
    kickDto: KickMemberRequest
  ): Promise<ChatMemberEntity | Error> {
    if (
      kickDto.queryingMemberRank === ChatMemberRank.USER ||
      kickDto.memberToKickRank === ChatMemberRank.OWNER
    )
      throw new Error("Wrong rank: Can't request operation");
    if (
      kickDto.memberToKickRank === ChatMemberRank.ADMIN &&
      kickDto.queryingMemberRank === ChatMemberRank.ADMIN
    )
      throw new Error("Wrong rank: Can't request operation");
    try {
      const chatMember = await this.prismaService.chatMember.delete({
        where: {
          id: kickDto.memberToKickUUID
        },
        include: {
          member: true,
          room: true
        }
      });
      const entity: ChatMemberEntity = new ChatMemberEntity(chatMember);
      return entity;
    } catch (error) {
      logger.error("Error kicking chat member", error);
      return error;
    }
  }

  /**
   * Invite users to a chat room
   *
   * If the room does not exist, return an error
   *
   * @param {InviteUsersToRoomRequest} req - The room to invite users to and the list of users to invite
   * @returns {Promise<ChatMemberEntity[] | Error>} - The list of users invited to the room
   */
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
        logger.error(`Error adding user ${username}`, e);
      }
    }
    return invitedUsers.map((user) => {
      return {
        username: user.username,
        roomName: req.roomName,
        avatar: user.avatar,
        chatMemberStatus: ChatMemberStatus.OK,
        userStatus: user.status,
        rank: ChatMemberRank.USER
      };
    });
  }

  /**
   * Send a Direct Message to a user
   *
   * If the sender or recipient does not exist, return an error
   * If the recipient has blocked the sender, return an error
   * If a dialogue room between the sender and the recipient already exists, return the existing room
   *
   * @param {SendDirectMessageRequest} req - The sender and recipient of the message
   * @returns {Promise<ChatRoomEntity | Error>} - The dialogue room between the sender and the recipient
   */
  async sendDirectMessage(
    req: SendDirectMessageRequest
  ): Promise<ChatRoomEntity | Error> {
    const { sender, recipient } = req;

    // Check if sender and recipient exist
    const [senderId, recipientId] = await Promise.all([
      this.prismaService.getUserIdByNick(sender),
      this.prismaService.getUserIdByNick(recipient)
    ]);

    if (!senderId || !recipientId) {
      return new Error("Invalid sender or recipient username");
    }

    // Check if the member is blocked by the recipient
    if (await this.prismaService.checkIfBlocked(recipientId, senderId))
      return new Error("You are blocked by the recipient");

    // Check if a dialogue room between the sender and the recipient already exists
    const existingRoom = await this.prismaService.chatRoom.findFirst({
      where: {
        AND: [
          { status: ChatRoomStatus.DIALOGUE },
          { members: { some: { memberId: senderId } } },
          { members: { some: { memberId: recipientId } } }
        ]
      }
    });

    if (existingRoom) {
      return this.getChatRoomEntity(existingRoom, req.senderRank);
    }

    // Create a new dialogue room and add both the sender and the recipient as members
    const newRoom = await this.prismaService.createDirectMessageRoom(
      senderId,
      recipientId,
      `${sender}$${recipient}$${Date.now()}`
    );
    return this.getChatRoomEntity(newRoom, ChatMemberRank.USER);
  }

  /**
   * Block a user. The user will not be able to send messages to the user who blocked them
   *
   * If the blocker or blockee does not exist, return an error
   * If the blocker and blockee are already blocking each other, return the existing block
   *
   * @param {BlockUserRequest} req - The blocker and blockee
   * @returns {Promise<BlockedUser | Error>} - The blocked user
   */
  async blockUser(req: BlockUserRequest): Promise<BlockedUser | Error> {
    try {
      const { blocker, blockee } = req;

      // Check if blocker and blockee exist
      const [blockerId, blockeeId] = await Promise.all([
        this.prismaService.getUserIdByNick(blocker),
        this.prismaService.getUserIdByNick(blockee)
      ]);

      if (!blockerId || !blockeeId) {
        return new Error("Invalid blocker or blockee username");
      }

      // Check if they were already blocking each other
      const existingBlock = await this.prismaService.blockedUser.findFirst({
        where: {
          blockerId,
          blockedUserId: blockeeId
        }
      });

      if (existingBlock) {
        return existingBlock;
      }

      // Create a new dialogue room and add both the sender and the recipient as members
      const newBlock = await this.prismaService.addBlockedUser(
        blockerId,
        blockeeId
      );
      return newBlock;
    } catch (error) {
      logger.error("Error blocking user", error);
      return error;
    }
  }

  /**
   * Get a list of chat rooms of which the user is a member.
   *  - If the user is a member of no rooms, return an empty list
   *  - If the user does not exist, return an error
   *
   * @param {BlockUserRequest} req - The blocker and blockee
   * @returns {Promise<BlockedUser | Error>} - The blocked user
   */
  async getRoomsOf(username: string): Promise<ChatRoomEntity[] | Error> {
    let rooms: ChatRoom[] = [];
    try {
      rooms = await this.prismaService.chatRoom.findMany({
        where: {
          members: {
            some: {
              member: {
                username
              },
              status: {
                not: ChatMemberStatus.BANNED
              }
            }
          }
        }
      });
    } catch (error) {
      error.message = `Error retrieving rooms of ${username}`;
      logger.error(error.message);
      return error;
    }

    const roomsOfUser: ChatRoomEntity[] = (
      await Promise.all(
        rooms.map(async (room) => {
          const roomEntity = await this.getChatRoomEntity(
            room,
            ChatMemberRank.USER
          );
          return roomEntity instanceof Error ? null : roomEntity;
        })
      )
    ).filter((roomEntity): roomEntity is ChatRoomEntity => roomEntity !== null);
    // omg what did JS make me do..? @oddtiming

    return roomsOfUser;
  }
}
