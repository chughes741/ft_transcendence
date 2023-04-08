import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ChatMember,
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoom,
  Match,
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

/*End of Mute and End of Ban:  */
//Is added to the current date (now)
const GLOBAL_T_IN_DAYS = 5 /*DAYS*/ * (24 * 60 * 60 * 1000); // One day in milliseconds

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
      this.match.deleteMany()
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
        name: roomName
      }
    });

    if (!chatRoom) {
      throw new Error(`Chat room with name "${roomName}" not found`);
    }

    const members = await this.chatMember.findMany({
      where: {
        room: {
          name: roomName
        }
      },
      include: {
        member: true
      }
    });

    const chatMembersWithUserInfo: ChatMemberPrismaType[] = members.map(
      (member) => {
        const { id, memberId, roomId, status, rank, endOfBan, endOfMute } =
          member;
        const {
          id: Userid2,
          username,
          email,
          avatar,
          status: status2
        } = member.member;

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
            status: status2
          }
        };
      }
    );
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
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<Match[]>}
   */
  async GetMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<Match[]> {
    return await this.match.findMany({
      where: {
        OR: [
          {
            player1: {
              id: getMatchHistoryRequest.id
            }
          },
          {
            player2: {
              id: getMatchHistoryRequest.id
            }
          }
        ]
      }
    });
  }

  /**
   * Returns a profile from the database
   *
   * @param {GetProfileRequest} getProfileRequest
   * @async
   * @returns {Promise<User>}
   */
  async GetProfile(getProfileRequest: GetProfileRequest): Promise<User> {
    return await this.user.findUnique({
      where: { id: getProfileRequest.id }
    });
  }

  async updateChatMemberStatus(updateDto: updateChatMemberStatusDto) {
    try {
      const chatroom = await this.chatRoom.findUnique({
        where: { name: updateDto.forRoomName },
        include: { members: true }
      });

      const member = chatroom.members.find(
        (member) => member.id === updateDto.memberToUpdateID
      );

      if (!member) {
        throw new Error("User is not a member of this chatroom");
      }

      //STATUS to UPDATE to:
      let newStatus: ChatMemberStatus = updateDto.changeStatusTo;
      //Return RESULT of status update
      let chatMember: ChatMember;

      // A future Date limit is established
      const futureDate = new Date(Date.now() + GLOBAL_T_IN_DAYS);

      //CASES : SWITCH BETWEEN STATUSES
      switch (newStatus) {
        case ChatMemberStatus.OK:
          console.log("User is OK");
          chatMember = await this.chatMember.update({
            where: { id: member.id },
            data: {
              status: newStatus,
              endOfBan: null,
              endOfMute: null
            }
          });
          break;
        case ChatMemberStatus.BLOCKED:
          console.log("User is blocked");
          chatMember = await this.chatMember.update({
            where: { id: member.id },
            data: { status: newStatus }
          });
          break;
        case ChatMemberStatus.MUTED:
          console.log("User is muted");
          chatMember = await this.chatMember.update({
            where: { id: member.id },
            data: { status: newStatus, endOfMute: futureDate }
          });
          break;
        case ChatMemberStatus.BANNED:
          console.log("User is banned");
          chatMember = await this.chatMember.update({
            where: { id: member.id },
            data: { status: newStatus, endOfBan: futureDate }
          });
          break;
        default:
          console.log("Unknown status");
      }
      return chatMember;
      //CATCH PRISMA ERROR
    } catch (error) {
      throw new Error(`Failed to member's status: ${error.message}`);
    }
  }

  async getChatMember(chatMemberId: number) {
    return await this.chatMember.findUnique({
      where: {
        id: chatMemberId
      }
    });
  }

  async destroyChatMember(id: number): Promise<void> {
    await this.chatMember.delete({
      where: { id }
    });
  }
}
