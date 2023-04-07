import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ChatMember,
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoom,
  Prisma,
  PrismaClient,
  User
} from "@prisma/client";
import {
  ChatRoomDto,
  ProfileDto,
  UserDto,
  MessageDto
} from "../auth/dto/prisma.dto";
import { ChatMemberPrismaType, MessagePrismaType } from "../chat/chat.gateway";
import config from "../config";

/** Here for profile */
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryEntity,
  ProfileEntity,
  UserStatus
} from "kingpong-lib";
import { updateChatMemberStatusDto } from "src/chat/dto/userlist.dto";

const logger = new Logger("PrismaService");

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    // Will call the constructor of the extended class
    super({
      datasources: {
        db: {
          url: config.database_url
        }
      }
    });
    Logger.log(configService.get("DATABASE_URL"));
  }

  /**
   * To be executed in testing, or to fully cleanup the db.
   * If you're not sure, probs best not to touch it.
   */
  cleanDb() {
    /**
     * Transaction delegates proper deletion order to prisma.
     * Accepts an array of operations.
     */
    return this.$transaction([
      this.chatRoom.deleteMany(),
      this.user.deleteMany(),
      this.chatMember.deleteMany(),
      this.message.deleteMany(),
      this.match.deleteMany(),
      this.player.deleteMany()
    ]);
  }
  async userExists(userId: string): Promise<boolean> {
    const user = await this.user.findUnique({ where: { id: userId } });
    return !!user;
  }

  async getUserIdByNick(nick: string): Promise<string> {
    const user = await this.user.findUnique({ where: { username: nick } });

    return user ? user.id : null;
  }

  /**
   * Returns a list of `limit` chat rooms members, including
   * their username and avatar.
   * @param roomId - id of the room
   * @param limit - number of members to return
   * @returns - list of members
   */

  //GET ROOM MEMBERS : Only function to exists now , returns ChatMemberPrismaType
  async getRoomMembers(roomName: string): Promise<ChatMemberPrismaType[]> {

    const chatRoom = await this.chatRoom.findUnique({
      where: {
        name: roomName,
      },
    });

    if (!chatRoom) {
      throw new Error(`Chat room with name "${roomName}" not found`);
    }

    const members = await this.chatMember.findMany({
      where: {
        room: {
          name: roomName,
        }
      },
      include: {
        member: true,
      },
    });

    const chatMembersWithUserInfo: ChatMemberPrismaType[] = members.map((member) => {
      const { id, memberId, roomId, status, rank, endOfBan, endOfMute } = member;
      const { id: Userid2, username, email, avatar, status: status2 } = member.member;

      return {
        id,
        memberId,
        roomId,
        status,
        rank,
        endOfBan,
        endOfMute,
        member: {
          id: Userid2,
          username,
          email,
          avatar,
          status: status2,
        },
      };
    });
    return chatMembersWithUserInfo;
  }
  // End

  async addUser(dto: UserDto) {
    const data: Prisma.UserCreateInput = {
      username: dto.username,
      // firstName: dto.firstName,
      // lastName: dto.lastName,
      hash: dto.password
    };
    return this.user.create({ data });
  }
  editUser(dto: UserDto) {
    return dto;
  }
  deleteUser(dto: UserDto) {
    return dto;
  }
  addProfile(dto: ProfileDto) {
    return dto;
  }
  editProfile(dto: ProfileDto) {
    return dto;
  }
  // Create a new chat room
  async createChatRoom(dto: ChatRoomDto): Promise<ChatRoom> {
    // Check if the owner UUID is valid
    // FIXME: this should use the userExists() method
    // TODO: remove this code when authentication is enabled
    logger.log(`dto.owner: ${dto.owner}`);
    const userID = await this.getUserIdByNick(dto.owner);
    logger.log(`userID: ${userID}`);
    console.log(dto);
    if (dto.owner && !userID) {
      throw new Error("Invalid owner UUID");
    }

    // Prepare the data for creating a chat room
    const data: Prisma.ChatRoomCreateInput = {
      status: dto.status,
      name: dto.name,
      password: dto.password
    };

    // Connect the owner if provided
    if (dto.owner) {
      data.owner = { connect: { id: userID } };
      // Add it as a chat member
      data.members = {
        create: [
          {
            member: { connect: { id: userID } },
            status: ChatMemberStatus.OK,
            rank: ChatMemberRank.OWNER
          }
        ]
      };
    }
    return this.chatRoom.create({ data });
  }

  /**
   * This method returns a page of chat rooms from the database of the specified size,
   * starting with the oldest chat room that is older than the date provided.
   *
   * @param uuid
   * @param pageSize number of chat rooms to return
   * @param dateOldest date of the oldest chat room retrieved thus far
   * @async
   * @memberof PrismaService
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/crud#pagination
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/crud#filtering
   * @returns
   */
  async getUserChatRooms(
    uuid: string,
    pageSize = 15,
    dateOldest: Date = new Date(Date.now())
  ): Promise<ChatRoomDto[] | Error> {
    // Check if the user exists
    const user = await this.user.findUnique({ where: { id: uuid } });
    if (!user) {
      return Error("User does not exist");
    }
    // Get `pageSize` amount of chat rooms, starting with the oldest one that is older than `dateOldest`
    // sorted in descending order of last activity
    const chatRooms = await this.chatRoom.findMany({
      where: {
        members: {
          some: {
            member: {
              id: uuid
            },
            // Check if status is NOT banned
            status: {
              not: ChatMemberStatus.BANNED
            }
          }
        },
        updatedAt: {
          lt: dateOldest // lt stands for less than
        }
      },
      take: pageSize, // take is the same as limit, and specifies the number of rows to return
      orderBy: { createdAt: "desc" }
    });
    return chatRooms;
  }

  /**
   * This method returns a page of messages from the database of the specified size,
   * starting with the oldest message that is older than the date provided.
   * @param id room id
   * @param date of the oldest message retrieved thus far
   * @param pageSize number of messages to return
   * @returns {Promise<MessageDto[]>} a page of messages
   * @async
   * @memberof PrismaService
   */
  async getChatMessagesPage(
    id: number,
    date: Date,
    pageSize: number
  ): Promise<MessagePrismaType[]> {
    return this.message.findMany({
      where: {
        room: { id },
        createdAt: { lt: date } // Here, lt stands for less than
      },
      include: {
        sender: {
          select: { username: true }
        },
        room: { select: { name: true } }
      },
      take: pageSize, // take is the same as limit, and specifies the number of rows to return
      orderBy: { createdAt: "desc" }
    });
  }

  // Get a chat room by ID
  async getChatRoomId(name: string): Promise<number | null> {
    const room = await this.chatRoom.findUnique({ where: { name } });
    return room ? room.id : null;
  }

  // Add a chat member to a chat room
  async addChatMember(
    userId: string,
    roomId: number,
    rank: ChatMemberRank
  ): Promise<ChatMember> {
    return this.chatMember.create({
      data: {
        memberId: userId,
        roomId: roomId,
        status: ChatMemberStatus.OK,
        rank: rank
      }
    });
  }

  // Update a chat room
  async updateChatRoom(
    id: number,
    dto: Partial<ChatRoomDto>
  ): Promise<ChatRoomDto> {
    const data: Prisma.ChatRoomCreateInput = {
      status: dto.status,
      name: dto.name,
      password: dto.password
    };
    return this.chatRoom.update({ where: { id }, data });
  }

  // Delete a chat room
  async deleteChatRoom(id: number): Promise<ChatRoomDto> {
    return this.chatRoom.delete({ where: { id } });
  }

  // Add a new message to a chat room
  async addMessageToChatRoom(dto: MessageDto): Promise<MessagePrismaType> {
    // Check if the owner UUID is valid
    const userExists = await this.userExists(dto.senderId);
    if (dto.senderId && !userExists) {
      logger.log(`userExists: ${userExists}`);
      return;
    }

    // Shape the data to be inserted into the database
    const data: Prisma.MessageCreateInput = {
      content: dto.content,
      sender: { connect: { id: dto.senderId } },
      room: { connect: { id: dto.roomId } }
    };

    // Add the message to the database and update the chat room's last activity
    const object = await this.$transaction([
      this.message.create({ data, include: { sender: true, room: true } }),
      this.chatRoom.update({
        where: { id: dto.roomId },
        data: { updatedAt: new Date() }
      })
    ]);
    return object[0];
  }

  async getLatestMessage(roomId: number): Promise<MessagePrismaType | null> {
    return this.message.findFirst({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { username: true } },
        room: { select: { name: true } }
      }
    });
  }

  /**
   * Fetches match history page from the database
   *
   * @todo fetch from db
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {MatchHistoryEntity} - MatchHistoryItem[]
   */
  async GetMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryEntity> {
    const matchHistory = new MatchHistoryEntity();
    matchHistory.matches = [
      {
        match_type: "Solo",
        players: "John",
        results: "Victory",
        date: "2022-03-15",
        winner: true
      },
      {
        match_type: "Duo",
        players: "John, Jane",
        results: "Defeat",
        date: "2022-03-16",
        winner: false
      },
      {
        match_type: "Squad",
        players: "John, Jane, Bob, Alice",
        results: "Victory",
        date: "2022-03-17",
        winner: true
      }
    ];
    return matchHistory;
  }

  /**
   * Returns a profile from the database
   *
   * @todo fetch from db
   * @param {GetProfileRequest} getProfileRequest
   * @async
   * @returns {ProfileEntity}
   */
  async GetProfile(
    getProfileRequest: GetProfileRequest
  ): Promise<ProfileEntity> {
    const profile = new ProfileEntity();
    profile.username = "schlurp";
    profile.avatar = "https://i.pravatar.cc/150";
    profile.status = UserStatus.ONLINE;
    profile.createdAt = "like three seconds ago, did you already forget?";
    return profile;
  }

  async updateChatMemberStatus(updateDto: updateChatMemberStatusDto) {
    try {
      const chatroom = await this.chatRoom.findUnique({
        where: { name: updateDto.roomName },
        include: { members: true },
      });

      const member = chatroom.members.find((member) => member.id === updateDto.memberId);

      if (!member) {
        throw new Error('User is not a member of this chatroom');
      }

      const updatedMember = await this.chatMember.update({
        where: { id: member.id },
        data: { status: updateDto.status},
      });

      
      const oneDayInMillis = 24 * 60 * 60 * 1000; // One day in milliseconds
      const futureDate = new Date(Date.now() + oneDayInMillis);


      return updatedMember;
    } catch (error) {
      throw new Error(`Failed to mute chat member: ${error.message}`);
    }
  }
}
