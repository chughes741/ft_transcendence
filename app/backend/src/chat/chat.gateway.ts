import { Logger, UnauthorizedException, UseGuards } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import { UserConnectionsService } from "../user-connections.service";
import { ChatService } from "./chat.service";

import { ChatMemberEntity, MessageEntity } from "./entities/message.entity";
import { UserStatus } from "@prisma/client";
import { KickMemberRequest, UpdateChatMemberRequest } from "./dto/userlist.dto";

import { AuthRequest, UserEntity } from "../auth/dto";
import {
  UpdateChatRoomRequest,
  ChatRoomEntity,
  DevError,
  AvailableRoomEntity,
  ListUsersRequest,
  CreateChatRoomRequest,
  JoinRoomRequest,
  RoomMemberEntity,
  LeaveRoomRequest,
  SendMessageRequest,
  InviteUsersToRoomRequest,
  SendDirectMessageRequest,
  BlockUserRequest,
  DevSuccess
} from "./chat.types";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { errorMonitor } from "events";
import { Token } from "src/tokenstorage/token-storage.service";

const logger = new Logger("ChatGateway");

/**
 * Chat gateway
 *
 * @todo Enable JWT authguard
 */
// @UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prismaService: PrismaService,
    private chatService: ChatService,
    private userConnectionsService: UserConnectionsService,
    private tokenVerify: TokenIsVerified,
  ) { }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    logger.warn(`Client connected: ${client.id}`);
    //console.log(client);
    //logger.debug(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    // Remove the user connection
    const connections = this.userConnectionsService.removeUserConnection(
      client.id,
      client.id
    );
    if (typeof connections === "string") {
      logger.debug(
        `Client ${client.id} has no more active connections, updating user status to OFFLINE`
      );

      this.prismaService.user.update({
        where: { username: connections },
        data: { status: UserStatus.OFFLINE }
      });
      this.userConnectionsService.removeUserEntries(connections);
    }
    const token = await this.tokenVerify.tokenStorage.getTokenbySocket(client.id);
    if (token && token.token_type !== "transiting") {
      this.tokenVerify.tokenStorage.removeToken(client.id);
      logger.log(`Client [${client.id}]'s Token Destroyed`)
    }
    logger.debug(`Client disconnected: ${client.id}`);
  }

  // Create a sendEventToAllUserSockets(member.username, "newChatRoomMember", newMember) function
  /* eslint-disable-next-line -- This function is not responsible for payload validation */
  async sendEventToAllUserSockets(username: string, event: string, data: any) {
    logger.debug(`Sending event ${event} to user ${username}`);
    const userSockets = this.userConnectionsService.getUserSockets(username);
    if (!userSockets) {
      logger.warn(`User ${username} has no sockets`);
      return;
    }
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
   * Update the status of a chat room member.
   *
   * @event "updateChatRoom"
   * @param {Socket} client - socket.io client
   * @param {UpdateChatRoomRequest} updateChatRoomRequest - request to update the chat room
   * @returns {ChatRoomEntity | DevError} - the updated chat room or an error
   */
  @SubscribeMessage("updateChatRoom")
  @UseGuards(TokenIsVerified)
  async updateChatRoom(
    client: Socket,
    updateChatRoomRequest: UpdateChatRoomRequest
  ): Promise<ChatRoomEntity | DevError> {
    const username = this.userConnectionsService.getUserBySocket(client.id);
    if (!username) {
      return { error: "User not found" };
    }
    logger.debug(
      `Received updateChatRoom request from ${username}, for room ${updateChatRoomRequest.roomName}`
    );
    /** @todo fix this weird try/catch/if */
    try {
      const updatedRoom = await this.chatService.updateRoom(
        updateChatRoomRequest
      );
      if (updatedRoom instanceof Error) {
        logger.error("Error updating room", updatedRoom);
        return { error: updatedRoom.message };
      }
      return updatedRoom;
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      logger.error("Error with updateChatRoom", error);
      return { error: "Internal server error" };
    }
  }

  /**
   * Get all available chat rooms from the server, and send them to the client,
   * excluding the ones the user is already in.
   *
   * Info sent back to the client:
   *  - room name
   *  - room status
   *  - room owner
   *  - amount of room members
   *
   * @event "listAvailableChatRooms"
   * @param {Socket} client - socket.io client
   * @param {string} username - username of the user
   * @param {string} roomName - name of the room
   * @returns {AvailableRoomEntity[]} - available rooms
   */
  @SubscribeMessage("listAvailableChatRooms")
  @UseGuards(TokenIsVerified)
  async listAvailableChatRooms(
    client: Socket,
    username: string
  ): Promise<AvailableRoomEntity[]> {
    try {
      // Update the return type
      const userId = await this.prismaService.getUserIdByNick(username);
      logger.debug(
        `Received listAvailableChatRooms request from ${userId}, name ${username}`
      );
      if (!userId) {
        return [];
      }

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
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  /**
   * Get all available users
   *
   * @event "listAvailableUsers"
   * @param {Socket} client - socket.io client
   * @param {ListUsersRequest} req - request to list users
   * @returns {User[]} - available users
   */
  @SubscribeMessage("listAvailableUsers")
  async listAvailableUsers(
    client: Socket,
    req: ListUsersRequest
  ): Promise<User[]> {
    logger.debug(`Received listAvailableUsers request from ${client.id}`);
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
      logger.debug(`List of users:`, availableUsers);
      return availableUsers;
    } catch (e) {
      logger.error(`Error while getting available users: ${e}`);
    }
    return [];
  }

  /**
   * Temporary function to login a user
   *
   * If the user does not exist, return an error
   * @todo remove this function when authentication is enabled
   *
   * @event "chatGatewayLogin"
   * @param {Socket} client
   * @param {AuthRequest} req
   * @returns {DevError | string}
   */
  @SubscribeMessage("chatGatewayLogin")
  async chatGatewayLogin(
    client: Socket,
    req: AuthRequest
  ): Promise<{ error: string } | string> {
    if (!req || !req.username) {
      return { error: "Invalid request: username must be provided" };
    }
    const username = req.username;
    logger.debug(
      `Received devUserLogin request from ${client.id} for user ${username}`
    );

    const userWasLoggedIn = await this.chatService.devUserLogin(req);
    if (userWasLoggedIn instanceof Error) {
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
   *
   * @event "createRoom"
   * @param {Socket} client - socket.io client
   * @param {CreateChatRoomRequest} createDto - chat room creation request
   * @returns {ChatRoomEntity | DevError} - created chat room or error
   */
  @SubscribeMessage("createRoom")
  @UseGuards(TokenIsVerified)
  async createRoom(
    client: Socket,
    createDto: CreateChatRoomRequest
  ): Promise<ChatRoomEntity | DevError> {
    // Log the request
    logger.debug(
      `Received createRoom request from ${createDto.owner} for room ${createDto.name
      }: ${createDto.status} ${createDto.password ? `, with password ${createDto.password}.` : "."
      }`
    );

    try {
      // Log the request
      //console.log(client);
      logger.debug(
        `Received createRoom request from ${createDto.owner} for room ${createDto.name
        }: ${createDto.status} ${createDto.password ? `, with password ${createDto.password}.` : "."
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
      logger.debug(
        `User ${createDto.owner} joined socket room ${createDto.name}`
      );
      return ret;
    } catch (Error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  /**
   * Get a list of chat rooms of which the user is a member.
   * If the user is not a member of any rooms, return an empty array.
   * If there is an error, return it.
   *
   * @event "getRoomsOf"
   * @param {Socket} client - socket.io client
   * @param {string} username
   * @returns {ChatRoomEntity[] | DevError} - list of chat rooms or error
   */
  @SubscribeMessage("getRoomsOf")
  //@UseGuards(TokenIsVerified)
  async getRoomsMemberOf(
    client: Socket,
    username: string
  ): Promise<ChatRoomEntity[] | DevError> {
    try {
      logger.debug(
        `Received getRoomsMemberOf request from ${username} with socket Id ${client.id}`
      );
      const rooms = await this.chatService.getRoomsOf(username);
      if (rooms instanceof Error) {
        return { error: rooms.message };
      }
      rooms.forEach((room) => client.join(room.name));
      return rooms;
    } catch (error) {
      //if (Error instanceof UnauthorizedException)
      //client.emit('unauthorized');
      return { error: error.message };
    }
  }

  /**
   * Join a chat room.
   *
   * If the room does not exist, create it.
   * Fetch a list of messages from the database and send them to the client.
   * If there is a password, check if it matches the one in the database.
   * If the user is not a member of the room, add them to the database.
   *
   * @event "joinRoom"
   * @param {Socket} client - socket.io client
   * @param {JoinRoomRequest} dto - join room request
   * @returns {DevError | ChatRoomEntity} - chat room or error
   */
  @SubscribeMessage("joinRoom")
  @UseGuards(TokenIsVerified)
  async joinRoom(
    client: Socket,
    dto: JoinRoomRequest
  ): Promise<DevError | ChatRoomEntity> {
    try {
      const username: string = this.userConnectionsService.getUserBySocket(
        client.id
      );
      logger.debug(
        `Received joinRoom request from ${username} for room ${dto.roomName} ${dto.password ? `: with password ${dto.password}` : ""
        }`
      );

      /** @todo move this to a "getChatRoomMessages" handler */
      // Assign the user id to the dto instead of the socket id
      // dto.user = username;
      const ret = await this.chatService.joinRoom(dto);
      // Find the user's ChatMember entity by finding the room name and the user id in the database

      // Find the chatMember in the returned ChatRoomEntity's ChatMemberEntity array

      if (ret instanceof Error) {
        logger.error("Error in joinRoom", ret);
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
        logger.debug(`User ${dto.user} joined room ${dto.roomName}`);
        return roomInfo;
      }
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  /**
   * Get a page of messages from a chat room.
   *
   * @event "getRoomMessagesPage"
   * @param {Socket} client - socket.io client
   * @param {GetRoomMessagesPageDto} dto - get room messages page request
   * @returns {MessageEntity[]} - array of messages
   */
  @SubscribeMessage("getRoomMessagesPage")
  @UseGuards(TokenIsVerified)
  async getRoomMessagesPage(
    client: Socket,
    dto: { roomName: string; date: Date; pageSize: number }
  ): Promise<MessageEntity[]> {
    try {
      const messages = await this.chatService.getRoomMessagesPage(
        dto.roomName,
        dto.date,
        dto.pageSize
      );
      return messages;
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  /**
   * Leave a chat room
   *
   * @event "leaveRoom"
   * @param {Socket} client - socket.io client
   * @param {LeaveRoomRequest} req - leave room request
   * @returns {DevError | string} - error or success message
   */
  @SubscribeMessage("leaveRoom")
  @UseGuards(TokenIsVerified)
  async leaveRoom(
    client: Socket,
    req: LeaveRoomRequest
  ): Promise<DevError | string> {
    try {
      logger.debug(`Received leaveRoom request from ${client.id}`);
      const clientId = this.userConnectionsService.getUserBySocket(client.id);
      if (!clientId) {
        logger.error(`User ${client.id} not found`);
        return { error: "User not found" };
      }
      const user = await this.prismaService.user.findUnique({
        where: { username: clientId }
      });
      req.username = user.username;
      const ret = await this.chatService.leaveRoom(req);
      if (ret instanceof Error) return { error: ret.message };
      client.leave(req.roomName);
      this.server.to(req.roomName).emit("chatRoomMemberLeft", req);
      logger.debug(`User ${client.id} left room ${req.roomName}`);
      return req.roomName;
    } catch (e) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      else logger.error(`User ${client.id} not found`);
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
   * @event "sendMessage"
   * @param {Socket} client - socket.io client
   * @param {SendMessageRequest} sendDto - send message request
   * @returns {DevError | string} - error or success message
   */
  @SubscribeMessage("sendMessage")
  @UseGuards(TokenIsVerified)
  async sendMessage(
    client: Socket,
    sendDto: SendMessageRequest
  ): Promise<DevError | string> {
    try {
      if (!sendDto.content) return;

      // Log the request
      logger.debug(
        `Received sendMessage request from ${sendDto.sender} to room ${sendDto.roomName}.`
      );

      // Try to get the user database ID
      const userId = await this.prismaService.getUserIdByNick(sendDto.sender);
      if (!userId) return { error: "User not found" };

      // Delegate business logic to the chat service
      const ret = await this.chatService.sendMessage(sendDto);
      if (ret instanceof Error) return { error: ret.message };

      logger.debug("Message sent successfully:", ret);
      // If nothing went wrong, send the message to the room
      this.server.to(sendDto.roomName).emit("newMessage", ret);
      logger.debug(
        `User ${sendDto.sender} sent message in room ${sendDto.roomName}: ${sendDto.content}`
      );
      return sendDto.roomName;
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  /**
   * Get a list of users in a chat room.
   *
   * @event "listUsers"
   * @param {Socket} client - socket.io client
   * @param {ListUsersRequest} payload - list users request
   * @returns {ChatMemberEntity[]} - array of chat members
   */
  @SubscribeMessage("listUsers")
  @UseGuards(TokenIsVerified)
  async listUsers(
    client: Socket,
    payload: ListUsersRequest
  ): Promise<ChatMemberEntity[]> {
    try {
      logger.debug(
        `Received listUsers request from ${client.id} for ${payload.chatRoomName}`
      );
      const list: ChatMemberEntity[] = await this.chatService.getUserList(
        payload.chatRoomName
      );
      return list;
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
    }
  }

  // Listener to hangle "inviteUsersToRoom" event, taking in a roomName and a list of usernames
  @SubscribeMessage("inviteUsersToRoom")
  @UseGuards(TokenIsVerified)
  async inviteUsersToRoom(
    client: Socket,
    req: InviteUsersToRoomRequest
  ): Promise<string[] | false> {
    try {
      logger.debug(
        `Received inviteUsersToRoom request from ${client.id}: `,
        req
      );
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

        logger.debug(`roomInfo: `, roomInfo);

        this.sendEventToAllUserSockets(
          member.username,
          "addedToNewChatRoom",
          roomInfo
        );
        // FIXME: Find a way to get the invited client's socket from the socket ID...
        this.bindAllUserSocketsToRoom(member.username, req.roomName);
      });
      return chatMembers.map((member) => member.username);
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      return false;
    }
  }

  /**
   * Update a chat member's status
   *
   * @event "updateChatMemberStatus"
   * @param {Socket} client - socket.io client
   * @param {UpdateChatMemberRequest} req - update chat member request
   * @returns {RoomMemberEntity | DevError} - updated chat member or error
   */
  @SubscribeMessage("updateChatMemberStatus")
  @UseGuards(TokenIsVerified)
  async updateChatMemberStatus(
    client: Socket,
    req: UpdateChatMemberRequest
  ): Promise<RoomMemberEntity | DevError> {
    try {
      logger.debug(
        `Received updateChatMemberStatus request from ${req.queryingUser} for ${req.usernameToUpdate}  in room ${req.roomName}`
      );

      const chatMember = await this.chatService.updateMemberStatus(req);
      if (chatMember.status === "BANNED") {
        /** @todo implement this */
        // Return this.kickChatMember, but with a different DTO
      }
      this.listUsers(client, { chatRoomName: req.roomName });
      /** @todo implement a listener on the client side to handle this event */
      //this.server.to(data.roomName).emit('chatMemberUpdated', chatMember);
      logger.debug("Chat Member's Status succesfully updated");
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
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      return { error: error.message };
    }
  }

  /**
   * Kick a chat member from a room
   *
   * @event "kickChatMember"
   * @param {Socket} client - socket.io client
   * @param {KickMemberRequest} req - kick member request
   * @returns {RoomMemberEntity | DevError} - updated chat member or error
   */
  @SubscribeMessage("kickChatMember")
  @UseGuards(TokenIsVerified)
  async kickChatMember(
    client: Socket,
    req: KickMemberRequest
  ): Promise<RoomMemberEntity | DevError> {
    try {
      const response = await this.chatService.kickMember(req);
      if (response instanceof Error) {
        return { error: response.message };
      } else {
        const user = response as ChatMemberEntity;
        /** @todo implement a listener on the client side to handle this event */
        this.server.to(req.roomName).emit("chatMemberKicked", user);
        return { roomName: req.roomName, user };
      }
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      return { error: error.message };
    }
  }

  /**
   * Send a Direct Message to a user, if the user is not blocked
   *
   * @event "sendDirectMessage"
   * @param {Socket} client - socket.io client
   * @param {SendDirectMessageRequest} req - send direct message request
   * @returns {ChatRoomEntity | DevError} - chat room entity or error
   */
  @SubscribeMessage("sendDirectMessage")
  @UseGuards(TokenIsVerified)
  async sendDirectMessage(
    client: Socket,
    req: SendDirectMessageRequest
  ): Promise<DevError | ChatRoomEntity> {
    try {
      logger.debug(
        `Received sendDirectMessage request from ${req.sender} to ${req.recipient}`
      );
      const ret = await this.chatService.sendDirectMessage(req);
      if (ret instanceof Error) return { error: ret.message };
      const room = ret as ChatRoomEntity;
      // bind all of both users' socket to the room, notify the new user of the room
      this.bindAllUserSocketsToRoom(req.sender, room.name);
      this.bindAllUserSocketsToRoom(req.recipient, room.name);
      this.sendEventToAllUserSockets(req.recipient, "addedToNewChatRoom", room);
      return room;
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      return { error: error.message };
    }
  }

  /**
   * Block a user from sending you direct messages
   *
   * @event "blockUser"
   * @param {Socket} client - socket.io client
   * @param {BlockUserRequest} req - block user request
   * @returns {DevError | DevSuccess} - success message or error
   */
  @SubscribeMessage("blockUser")
  @UseGuards(TokenIsVerified)
  async blockUser(
    client: Socket,
    req: BlockUserRequest
  ): Promise<DevError | DevSuccess> {
    try {
      logger.debug(
        `Received blockUser request from ${req.blocker} to block ${req.blockee}`
      );
      const ret = await this.chatService.blockUser(req);
      if (ret instanceof Error) return { error: ret.message };
      return { success: "User blocked successfully" };
    } catch (error) {
      if (Error instanceof UnauthorizedException) client.emit("unauthorized");
      return { error: error.message };
    }
  }
}
