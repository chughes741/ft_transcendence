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
import { kickMemberDto, updateChatMemberStatusDto } from "./dto/userlist.dto";

// FIXME: temporary error type until we can share btw back and frontend
export type DevError = {
  error: string;
};

/******************/
/*    Requests    */
/******************/
export interface ListUsersRequest {
  chatRoomName: string;
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
  chatMemberstatus: ChatMemberStatus;
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
  password?: string;
  oldPassword?: string;
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

// FIXME: uncomment the following line to enable authentication
// @UseGuards(JwtWsAuthGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private prismaService: PrismaService,
    private chatService: ChatService,
    private userConnectionsService: UserConnectionsService
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    logger.log("ChatGateway initialized");
  }

  async handleConnection(client: Socket) {
    logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Remove the user connection
    this.userConnectionsService.removeUserConnection(client.id, client.id);

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
    const username = await this.userConnectionsService.getUserBySocket(
      client.id
    );
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
    username: string
  ): Promise<AvailableRoomEntity[]> {
    const userId = await this.prismaService.getUserIdByNick(username);
    logger.log(
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
    username: string
  ): Promise<DevError | string> {
    logger.log(
      `Received createUser request from ${client.id} for user ${username}`
    );
    const userWasCreated = await this.chatService.createTempUser(
      client.id,
      username
    );
    if (userWasCreated instanceof Error) {
      return { error: userWasCreated.message };
    }
    return username;
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
    username: string
  ): Promise<{ error: string } | string> {
    logger.log(
      `Received createUser request from ${client.id} for user ${username}`
    );

    const userWasLoggedIn = await this.chatService.devUserLogin(username);
    if (userWasLoggedIn instanceof Error) {
      console.log(userWasLoggedIn);
      return { error: userWasLoggedIn.message };
    }

    // Add the user connection to the UserConnections map
    this.userConnectionsService.addUserConnection(username, client.id);
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
    logger.log(`User ${client.id} left room ${req.roomName}`);
    return req.roomName;
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
    data: updateChatMemberStatusDto
  ): Promise<string> {
    try {
      //Try to update the satus
      const chatMember = await this.chatService.updateMemberStatus(data);
      //If Successful, Broadcast back the updated list
      if (chatMember)
        await this.listUsers(client, { chatRoomName: data.forRoomName });

      // (Might not be useful now that we broadcast the list) Broadcast the updated chat member information to all clients connected to the chat
      //this.server.to(data.roomName).emit('chatMemberUpdated', chatMember);

      return "Chat Member's Status succesfully updated !";
    } catch (error) {
      return error.message;
    }
  }

  @SubscribeMessage("kickChatMember")
  async kickChatMember(client: Socket, data: kickMemberDto): Promise<string> {
    try {
      const response = await this.chatService.kickMember(data);
      if (
        response ===
        "Chat Member " +
          data.ChatMemberToKickName +
          " kicked out successfully !"
      ) {
        const list: ChatMemberEntity[] = await this.chatService.getUserList(
          data.roomName
        );
        this.server.to(data.roomName).emit("userList", list);
      }
      return response;
    } catch (error) {
      return error.message;
    }
  }
}
