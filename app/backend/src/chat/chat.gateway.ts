import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { ChatMemberRank, ChatRoomStatus, User } from "@prisma/client";
import { UserConnectionsService } from "../user-connections.service";
import { ChatService } from "./chat.service";

import { Message } from "@prisma/client";
import { ChatMember } from "@prisma/client";
import { ChatMemberEntity, MessageEntity } from "./entities/message.entity";
import { ChatMemberStatus, UserStatus } from "@prisma/client";
import { KickMemberRequest, UpdateChatMemberRequest } from "./dto/userlist.dto";

import { AuthRequest } from "../auth/dto";
import { TokenStorageService } from "src/tokenstorage/token-storage.service";

// FIXME: temporary error type until we can share btw back and frontend
export type DevError = {
  error: string;
};
export type DevSuccess = {
  success: string;
};

/******************/
/*    Requests    */
/******************/
export interface ListUsersRequest {
  chatRoomName: string;
}

export interface SendDirectMessageRequest {
  recipient: string;
  sender: string;
  senderRank: ChatMemberRank;
}

export interface CreateUserRequest {
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface MessagePrismaType extends Message {
  sender: { username: string };
  room: { name: string };
}

export interface InviteUsersToRoomRequest {
  roomName: string;
  usernames: string[];
}

export interface ChatMemberPrismaType extends ChatMember {
  member: {
    avatar: string;
    username: string;
    status: UserStatus;
  };
  room: { name: string };
}

export interface IChatMemberEntity {
  username: string;
  roomName: string;
  avatar: string;
  chatMemberStatus: ChatMemberStatus;
  userStatus: UserStatus;
  rank: ChatMemberRank;
  endOfBan?: Date;
  endOfMute?: Date;
}

export interface IMessageEntity {
  username: string;
  roomName: string;
  content: string;
  timestamp: Date;
}

export type RoomMemberEntity = {
  roomName: string;
  user: ChatMemberEntity;
};

export interface ChatRoomEntity {
  name: string;
  queryingUserRank: ChatMemberRank; // FIXME: This should be embedded in the ChatMember type
  status: ChatRoomStatus;
  members: ChatMemberEntity[];
  latestMessage?: IMessageEntity;
  lastActivity: Date;
  avatars?: string[];
}

export interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

export interface AvailableRoomEntity {
  roomName: string;
  nbMembers: number;
  status: ChatRoomStatus;
  owner: UserEntity;
}

const logger = new Logger("ChatGateway");

export class CreateChatRoomDto {
  name: string;
  status: ChatRoomStatus;
  password: string;
  owner: string;
}

export class UpdateChatRoomRequest {
  username: string;
  roomName: string;
  status: ChatRoomStatus;
  oldPassword?: string;
  newPassword?: string;
}

export class SendMessageDto {
  roomName: string;
  content: string;
  sender: string;
}

export class JoinRoomDto {
  roomName: string;
  password: string;
  user: string;
}

export class LeaveRoomRequest {
  roomName: string;
  username: string;
}

export class BlockUserRequest {
  blocker: string;
  blockee: string;
}

// FIXME: uncomment the following line to enable authentication
// @UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private prismaService: PrismaService,
    private chatService: ChatService,
    private userConnectionsService: UserConnectionsService,
    private tokenStorage: TokenStorageService
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    logger.log("ChatGateway initialized");
  }

  async handleConnection(client: Socket) {
    logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    // Remove the user connection
    await this.tokenStorage.removeToken(client.id);
    const connections = this.userConnectionsService.removeUserConnection(
      client.id,
      client.id
    );
    if (typeof connections === "string") {
      logger.log(
        `Client ${client.id} has no more active connections, updating user status to OFFLINE`
      );

      this.prismaService.user.update({
        where: { username: connections },
        data: { status: UserStatus.OFFLINE }
      });
      this.userConnectionsService.removeUserEntries(connections);
    }

    logger.log(`Client disconnected: ${client.id}`);
  }

  // Create a sendEventToAllUserSockets(member.username, "newChatRoomMember", newMember) function
  /* eslint-disable-next-line -- This function is not responsible for payload validation*/
  async sendEventToAllUserSockets(username: string, event: string, data: any) {
    logger.log(`Sending event ${event} to user ${username}`);
    const userSockets = this.userConnectionsService.getUserSockets(username);
    if (!userSockets) {
      logger.warn(`User ${username} has no sockets`);
      return;
    }
    console.log(data);
    userSockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  async bindAllUserSocketsToRoom(username: string, roomName: string) {
    const userSockets = this.userConnectionsService.getUserSockets(username);
    if (!userSockets) {
      logger.warn(`User ${username} has no sockets`);
      return;
    }
    userSockets.forEach((socketId) => {
      const invitedUserSocket = this.server.sockets.sockets.get(socketId);
      invitedUserSocket?.join(roomName);
    });
  }

  async unbindAllUserSocketsFromRoom(username: string, roomName: string) {
    const userSockets = this.userConnectionsService.getUserSockets(username);
    if (!userSockets) {
      logger.warn(`User ${username} has no sockets`);
      return;
    }
    userSockets.forEach((socketId) => {
      const invitedUserSocket = this.server.sockets.sockets.get(socketId);
      invitedUserSocket?.leave(roomName);
    });
  }

  /**
   * @event "updateChatRoom"
   * Update the status of a chat room member.
   * @param client - socket client
   * @param updateChatRoomRequest - updated room info
   * @returns updated room info if successful, error otherwise
   */
  @SubscribeMessage("updateChatRoom")
  async updateChatRoom(
    client: Socket,
    updateChatRoomRequest: UpdateChatRoomRequest
  ): Promise<ChatRoomEntity | DevError> {
    const username = this.userConnectionsService.getUserBySocket(client.id);
    if (!username) {
      return { error: "User not found" };
    }
    logger.log(
      `Received updateChatRoom request from ${username}, for room ${updateChatRoomRequest.roomName}`
    );
    console.log(updateChatRoomRequest);
    // FIXME: Should not have to be here
    try {
      const updatedRoom = await this.chatService.updateRoom(
        updateChatRoomRequest
      );
      if (updatedRoom instanceof Error) {
        logger.error("Error updating room", updatedRoom);
        return { error: updatedRoom.message };
      }
      logger.warn("It worked?", updatedRoom);
      return updatedRoom;
    } catch (error) {
      logger.error(error);
      return { error: "Internal server error" };
    }
  }

  /**
   * @event "listAvailableChatRooms"
   * Get all available chat rooms from the server, and send them to the client,
   * excluding the ones the user is already in.
   * Info sent back to the client:
   *  - room name
   *  - room status
   *  - room owner
   *  - amount of room members
   * @param client socket client
   * @param username username of the user requesting the list
   * @returns list of chat rooms
   */
  @SubscribeMessage("listAvailableChatRooms")
  async listAvailableChatRooms(
    client: Socket,
    username: string,
    roomName: string // Add roomName parameter
  ): Promise<AvailableRoomEntity[] | UserEntity[]> {
    // Update the return type
    const userId = await this.prismaService.getUserIdByNick(username);
    logger.log(
      `Received listAvailableChatRooms request from ${userId}, name ${username}`
    );
    if (!userId) {
      return [];
    }

    // If roomName is empty, return available users
    if (!roomName) {
      const availableUsers = await this.prismaService.getAvailableUsers(
        userId,
        null
      );
      return availableUsers.map((user) => ({
        username: user.username,
        avatar: user.avatar,
        status: user.status
      }));
    }

    // Otherwise, return available rooms
    const availableRooms = await this.prismaService.getAvailableChatRooms(
      userId
    );
    const rooms: AvailableRoomEntity[] = availableRooms?.map((room) => {
      return {
        roomName: room.name,
        status: room.status,
        nbMembers: room.members.length,
        owner: {
          username: room.owner?.username,
          avatar: room.owner?.avatar,
          status: room.owner?.status
        }
      };
    });

    return rooms;
  }

  /**
   * Get all available users
   */
  @SubscribeMessage("listAvailableUsers")
  async listAvailableUsers(
    client: Socket,
    req: ListUsersRequest
  ): Promise<User[]> {
    logger.log(`Received listAvailableUsers request from ${client.id}`);
    const username = this.userConnectionsService.getUserBySocket(client.id);
    const userId = await this.prismaService.getUserIdByNick(username);
    const roomId = await this.prismaService.getChatRoomId(req.chatRoomName);
    if (!userId || (!roomId && req.chatRoomName !== "")) {
      logger.error(`User id: ${userId} or room id: ${roomId} not found`);
      return [];
    }

    try {
      const availableUsers = await this.prismaService.getAvailableUsers(
        userId,
        roomId
      );
      logger.warn(`List of users: `);
      console.log(availableUsers);
      return availableUsers;
    } catch (e) {
      logger.error(`Error while getting available users: ${e}`);
    }
    return [];
  }

  /**
   * Temporary function to create a user
   *
   * If there is an error in the service, return it
   *
   * TODO: remove this function when authentication is enabled
   * @param client socket client
   * @param username
   * @returns DevError or username
   */
  @SubscribeMessage("userCreation")
  async createTempUser(
    client: Socket,
    req: AuthRequest
  ): Promise<DevError | UserEntity> {
    logger.log(
      `Received createUser request from ${client.id} for user ${req.username}`
    );
    const userWasCreated = await this.chatService.createTempUser(req);
    if (userWasCreated instanceof Error) {
      return { error: userWasCreated.message };
    }
    this.userConnectionsService.addUserConnection(
      userWasCreated.username,
      client.id
    );
    return userWasCreated;
  }

  /**
   * Temporary function to login a user
   * If the user does not exist, return an error
   * TODO: remove this function when authentication is enabled
   * @param client socket client
   * @param username
   * @returns DevError or username
   */
  @SubscribeMessage("userLogin")
  async devUserLogin(
    client: Socket,
    req: AuthRequest
  ): Promise<{ error: string } | string> {
    if (!req || !req.username) {
      return { error: "Invalid request: username must be provided" };
    }
    const username = req.username;
    logger.log(
      `Received devUserLogin request from ${client.id} for user ${username}`
    );

    const userWasLoggedIn = await this.chatService.devUserLogin(req);
    if (userWasLoggedIn instanceof Error) {
      console.log(userWasLoggedIn);
      return { error: userWasLoggedIn.message };
    }

    // Update the user status to online
    this.prismaService.user.update({
      where: { username },
      data: { status: UserStatus.ONLINE }
    });

    // Add the user connection to the UserConnections map
    this.userConnectionsService.addUserConnection(username, client.id);

    // Load the list of blocked users and users blocking the logged-in user
    const [blockedUsers, blockingUsers] = await Promise.all([
      this.prismaService.getUsersBlockedBy(username),
      this.prismaService.getUsersBlocking(username)
    ]);

    blockedUsers.forEach((blockedUser) =>
      this.userConnectionsService.addUserToBlocked(
        username,
        blockedUser.username
      )
    );
    blockingUsers.forEach((blockingUser) =>
      this.userConnectionsService.addUserToBlocked(
        blockingUser.username,
        username
      )
    );

    return username;
  }

  /**
   * Create a new chat room.
   *
   * If the chat room is successfully created, add the user to the socket room.
   * If the chat service returns an error, return it
   * @param client socket client
   * @param room CreateRoomDto
   * @returns DevError or room name
   */
  @SubscribeMessage("createRoom")
  async createRoom(
    client: Socket,
    createDto: CreateChatRoomDto
  ): Promise<ChatRoomEntity | DevError> {
    // Log the request
    logger.log(
      `Received createRoom request from ${createDto.owner} for room ${
        createDto.name
      }: ${createDto.status} ${
        createDto.password ? `, with password ${createDto.password}.` : "."
      }`
    );

    // Add the room to the database
    const ret = await this.chatService.createRoom(createDto);

    // If the room already exists, return an error
    if (ret instanceof Error) {
      return { error: ret.message };
    }

    // Add the user to the socket room
    client.join(createDto.name);
    logger.log(`User ${createDto.owner} joined socket room ${createDto.name}`);
    console.log(createDto);
    return ret;
  }

  /**
   * Join a chat room.
   * If the room does not exist, create it.
   * Fetch a list of messages from the database and send them to the client.
   * If there is a password, check if it matches the one in the database.
   * If the user is not a member of the room, add them to the database.
   *
   * @param client client socket
   * @param dto JoinRoomDto, containing the room name and password
   * @returns DevError or room name
   */
  @SubscribeMessage("joinRoom")
  async joinRoom(
    client: Socket,
    dto: JoinRoomDto
  ): Promise<DevError | ChatRoomEntity> {
    const username: string = this.userConnectionsService.getUserBySocket(
      client.id
    );
    logger.log(
      `Received joinRoom request from ${username} for room ${dto.roomName} ${
        dto.password ? `: with password ${dto.password}` : ""
      }`
    );

    // TODO: move this to a "getChatRoomMessages" handler
    // Assign the user id to the dto instead of the socket id
    dto.user = username;
    const ret = await this.chatService.joinRoom(dto);
    // Find the user's ChatMember entity by finding the room name and the user id in the database

    // Find the chatMember in the returned ChatRoomEntity's ChatMemberEntity array

    if (ret instanceof Error) {
      logger.error(ret);
      return { error: ret.message };
    } else if (ret) {
      const chatMember = ret.members?.find(
        (member) => member.username === username
      );
      const roomInfo: ChatRoomEntity = ret;
      client.join(dto.roomName);
      const newMember: RoomMemberEntity = {
        roomName: dto.roomName,
        user: chatMember
      };
      this.server.to(dto.roomName).emit("newChatRoomMember", newMember);
      logger.log(`User ${dto.user} joined room ${dto.roomName}`);
      return roomInfo;
    }
  }

  // Add a new event to get a page of messages
  @SubscribeMessage("getRoomMessagesPage")
  async getRoomMessagesPage(
    client: Socket,
    dto: { roomName: string; date: Date; pageSize: number }
  ): Promise<MessageEntity[]> {
    const messages = await this.chatService.getRoomMessagesPage(
      dto.roomName,
      dto.date,
      dto.pageSize
    );
    return messages;
  }

  /**
   * Leave a chat room
   * @param client client socket
   * @param room name of the room to leave
   */
  @SubscribeMessage("leaveRoom")
  async leaveRoom(
    client: Socket,
    req: LeaveRoomRequest
  ): Promise<DevError | string> {
    logger.warn(`Received leaveRoom request from ${client.id}`);
    console.log(req);
    const clientId = this.userConnectionsService.getUserBySocket(client.id);
    if (!clientId) {
      logger.error(`User ${client.id} not found`);
      return { error: "User not found" };
    }
    try {
      const user = await this.prismaService.user.findUnique({
        where: { username: clientId }
      });
      req.username = user.username;
      const ret = await this.chatService.leaveRoom(req);
      if (ret instanceof Error) return { error: ret.message };
      client.leave(req.roomName);
      this.server.to(req.roomName).emit("chatRoomMemberLeft", req);
      logger.log(`User ${client.id} left room ${req.roomName}`);
      return req.roomName;
    } catch (e) {
      logger.error(`User ${clientId} not found`);
      return { error: e.message };
    }
  }

  /**
   * Send a message to a chat room.
   *
   * If the room does not exist, return an error.
   * If the room exists, send the message to the room and broadcast it to
   * all clients in the room
   *
   * @param client
   * @param sendDto
   * @returns
   */
  @SubscribeMessage("sendMessage")
  async sendMessage(
    client: Socket,
    sendDto: SendMessageDto
  ): Promise<DevError | string> {
    if (!sendDto.content) return;

    // Log the request
    logger.log(
      `Received sendMessage request from ${sendDto.sender} to room ${sendDto.roomName}.`
    );

    // Try to get the user database ID
    const userId = await this.prismaService.getUserIdByNick(sendDto.sender);
    if (!userId) return { error: "User not found" };

    // Delegate business logic to the chat service
    const ret = await this.chatService.sendMessage(sendDto);
    if (ret instanceof Error) return { error: ret.message };

    logger.log(`Message sent successfully: `);
    console.log(ret);
    // If nothing went wrong, send the message to the room
    this.server.to(sendDto.roomName).emit("newMessage", ret);
    logger.log(
      `User ${sendDto.sender} sent message in room ${sendDto.roomName}: ${sendDto.content}`
    );
    return sendDto.roomName;
  }

  /*
    GET USER LIST : Get all user information relevant for the chat user tab Component
    Takes a ChatmemberPrismaType array and transforms it into a ChatMemberEntity[], expected by the client
  */

  @SubscribeMessage("listUsers")
  async listUsers(
    client: Socket,
    payload: ListUsersRequest
  ): Promise<ChatMemberEntity[]> {
    logger.log(`Received listUsers request from ${client.id}, sending list`);
    const list: ChatMemberEntity[] = await this.chatService.getUserList(
      payload.chatRoomName
    );
    return list;
  }

  // Listener to hangle "inviteUsersToRoom" event, taking in a roomName and a list of usernames
  @SubscribeMessage("inviteUsersToRoom")
  async inviteUsersToRoom(
    client: Socket,
    req: InviteUsersToRoomRequest
  ): Promise<string[] | false> {
    logger.log(`Received inviteUsersToRoom request from ${client.id}: `);
    console.log(req);
    // Get the list of Database users to invite from the req's usernames array

    const chatMembers = await this.chatService.inviteUsersToRoom(req);
    if (chatMembers instanceof Error) return false;
    const room = await this.prismaService.chatRoom.findUnique({
      where: { name: req.roomName }
    });

    chatMembers.forEach(async (member) => {
      const newMemberEntity: RoomMemberEntity = {
        roomName: req.roomName,
        user: member
      };
      this.server.to(req.roomName).emit("newChatRoomMember", newMemberEntity);

      const roomInfo = await this.chatService.getChatRoomEntity(
        room,
        member.rank
      );

      logger.log(`roomInfo: `);
      console.log(roomInfo);

      this.sendEventToAllUserSockets(
        member.username,
        "addedToNewChatRoom",
        roomInfo
      );
      // FIXME: Find a way to get the invited client's socket from the socket ID...
      this.bindAllUserSocketsToRoom(member.username, req.roomName);
    });
    return chatMembers.map((member) => member.username);
  }

  @SubscribeMessage("updateChatMemberStatus")
  async updateChatMemberStatus(
    client: Socket,
    req: UpdateChatMemberRequest
  ): Promise<RoomMemberEntity | DevError> {
    logger.log(
      `Received updateChatMemberStatus request from ${req.queryingUser} for ${req.usernameToUpdate}  in room ${req.roomName}`
    );
    console.log(req);

    try {
      const chatMember = await this.chatService.updateMemberStatus(req);
      if (chatMember.status === "BANNED") {
        // TODO: implement this
        // Return this.kickChatMember, but with a different DTO
      }
      this.listUsers(client, { chatRoomName: req.roomName });
      // TODO: implement a listener on the client side to handle this event
      //this.server.to(data.roomName).emit('chatMemberUpdated', chatMember);
      logger.log("Chat Member's Status succesfully updated !");
      console.log(chatMember);
      const user: ChatMemberEntity = {
        username: chatMember.member.username,
        roomName: req.roomName,
        avatar: chatMember.member.avatar,
        chatMemberStatus: chatMember.status,
        userStatus: chatMember.member.status,
        rank: chatMember.rank,
        endOfBan: chatMember.endOfBan,
        endOfMute: chatMember.endOfMute
      };
      const newMember: RoomMemberEntity = {
        roomName: req.roomName,
        user
      };
      this.server.to(req.roomName).emit("chatMemberUpdated", newMember);
      if (chatMember.status === "BANNED") {
        this.unbindAllUserSocketsFromRoom(req.usernameToUpdate, req.roomName);
      }
      return newMember;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage("kickChatMember")
  async kickChatMember(
    client: Socket,
    req: KickMemberRequest
  ): Promise<RoomMemberEntity | DevError> {
    const response = await this.chatService.kickMember(req);
    if (response instanceof Error) {
      return { error: response.message };
    } else {
      const user = response as ChatMemberEntity;
      // TODO: implement a listener on the client side to handle this event
      this.server.to(req.roomName).emit("chatMemberKicked", user);
      return { roomName: req.roomName, user };
    }
  }

  /**
   * Send a Direct Message to a user, if the user is not blocked
   * @param {Socket} client
   * @param {SendDirectMessageRequest} req
   * @returns {Promise<DevError | ChatRoomEntity>}
   */
  @SubscribeMessage("sendDirectMessage")
  async sendDirectMessage(
    client: Socket,
    req: SendDirectMessageRequest
  ): Promise<DevError | ChatRoomEntity> {
    logger.log(
      `Received sendDirectMessage request from ${req.sender} to ${req.recipient}`
    );
    console.log(req);
    const ret = await this.chatService.sendDirectMessage(req);
    if (ret instanceof Error) return { error: ret.message };
    const room = ret as ChatRoomEntity;
    // bind all of both users' socket to the room, notify the new user of the room
    this.bindAllUserSocketsToRoom(req.sender, room.name);
    this.bindAllUserSocketsToRoom(req.recipient, room.name);
    this.sendEventToAllUserSockets(req.recipient, "addedToNewChatRoom", room);

    return room;
  }

  /**
   * Block a user from sending you direct messages
   * @param {Socket} client
   * @param {BlockUserRequest} req
   * @returns {Promise<DevError | BlockedUserEntity>}
   * @memberof ChatGateway
   */
  @SubscribeMessage("blockUser")
  async blockUser(
    client: Socket,
    req: BlockUserRequest
  ): Promise<DevError | { success: string }> {
    logger.log(
      `Received blockUser request from ${req.blocker} to block ${req.blockee}`
    );
    console.log(req);
    const ret = await this.chatService.blockUser(req);
    if (ret instanceof Error) return { error: ret.message };
    return { success: "User blocked successfully" };
  }
}
