import { Injectable, Logger } from "@nestjs/common";
import {
  ChatMember,
  ChatMemberRank,
  ChatMemberStatus,
  ChatRoom,
  ChatRoomStatus,
  Match,
  Prisma,
  PrismaClient,
  User
} from "@prisma/client";
import { ChatRoomDto, MessageDto } from "../auth/dto/prisma.dto";
import {
  ChatMemberPrismaType,
  MessagePrismaType,
  UpdateChatRoomRequest
} from "../chat/chat.gateway";
import config from "../config";

/** Here for profile */
import {
  AddFriendRequest,
  GetFriendsRequest,
  GetMatchHistoryRequest,
  GetProfileRequest
} from "kingpong-lib";


/*End of Mute and End of Ban:  */
//Is added to the current date (now)
const GLOBAL_T_IN_DAYS = 5 /*DAYS*/ * (24 * 60 * 60 * 1000); // One day in milliseconds

import { UpdateChatMemberRequest } from "src/chat/dto/userlist.dto";
import { UserEntity } from "../auth/dto";


const logger = new Logger("PrismaService");

/** @todo needs to be in kingpong-lib */
interface MatchPrismaType extends Match {
  player1: User;
  player2: User;
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // Will call the constructor of the extended class
    super({
      datasources: {
        db: {
          url: config.database_url
        }
      }
    });
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
  /**
   * Checks if a user with the given userId exists in the database.
   * @param {string} userId - The id of the user.
   * @returns {Promise<boolean>} - A Promise that resolves to true if the user exists, false otherwise.
   * @async
   */
  async userExists(userId: string): Promise<boolean> {
    if (!userId) {
      logger.error("userExists: userId is required");
      return false;
    }

    try {
      const user = await this.user.findUnique({ where: { id: userId } });
      return !!user;
    } catch (err) {
      return false;
    }
  }

  async userNameExists(username: string): Promise<boolean> {
    if (!username) {
      logger.error("userExists: User username is required");
      return false;
    }

    try {
      const user = await this.user.findUnique({ where: { username: username } });
      return !!user;
    } catch (err) {
      return false;
    }
  }

  async changeUserName(userName : string, newUsername : string) : Promise<boolean>{
    
    const nameExists = await this.userNameExists(newUsername);
    if (nameExists)
      return false;
    await this.user.update({
      where : {
        username : userName
      },
      data: {
        username : newUsername
      }
    })
    return true;
  }

  /**
   * Gets the user id of a user with the specified nick.
   * @param {string} nick - The user's nick.
   * @returns {Promise<string>} - A Promise that resolves to the user id if the user is found, or an error if not found.
   * @async
   */
  async getUserIdByNick(nick: string): Promise<string | null> {
    if (!nick) {
      return null;
    }

    try {
      const user = await this.user.findUnique({ where: { username: nick } });
      return user.id;
    } catch (err) {
      return null;
    }
  }

  /**
   * Returns a list of `limit` chat rooms members, including
   * their username and avatar.
   * @param roomId - id of the room
   * @param limit - number of members to return
   * @returns - list of members
   */
  async getRoomMembers(
    roomName: string,
    limit = 100
  ): Promise<ChatMemberPrismaType[]> {
    if (!roomName) {
      throw new Error("Room name is required");
    }
    const members = await this.chatMember.findMany({
      where: { room: { name: { equals: roomName } } },
      include: {
        member: {
          select: {
            avatar: true,
            username: true,
            status: true
          }
        },
        room: { select: { name: true } }
      },
      take: limit
    });
    return members;
  }

  /**
   * Adds a user to the database
   * @param req - dto containing the room name and the user id
   * @returns {Promise<User>} - A Promise that resolves to the chat member if the user is found, or an error if not found.
   */
  async addUser(req: UserEntity): Promise<User> {
    logger.warn(`addUser:`);
    console.log(req);
    if (!req.username || !req.avatar) {
      throw new Error(
        `Missing required fields: ${!!req.avatar && "avatar, "} ${
          !!req.username && "username, "
        }`
      );
    }
    const data: Prisma.UserCreateInput = {
      username: req.username,
      firstName: req.firstName,
      lastName: req.lastName,
      avatar: req.avatar,
      email: req.email,
      status: req.status
    };
    return this.user.create({ data });
  }

  /**
   * Creates a new chat room with the provided data.
   * @param {ChatRoomDto} dto - The data transfer object containing the chat room data.
   * @returns {Promise<ChatRoom>} - A Promise that resolves to the created chat room.
   * @async
   */
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
   * Get ${pageSize} chat rooms older than the date provided.
   *
   * @param {string} userId - The id of the user querying the chat rooms.
   * @param {Date} [dateOldest=new Date(Date.now())] - The date of the oldest chat room retrieved thus far. Defaults to the current date and time.
   * @param {number} [pageSize=15] - The number of chat rooms to return. Defaults to 15.
   * @returns {Promise<PrismaType[]>} - A Promise that resolves to an array of chat rooms.
   * @async
   */
  async getAvailableChatRooms(
    userId: string,
    dateOldest: Date = new Date(Date.now()),
    pageSize = 15
    // TODO: define PrismaType for this
  ): Promise<any> {
    // Check if the user exists
    if (!userId) {
      logger.error("getAvailableChatRooms: userId is required");
      return new Error("User ID is required");
    }
    const user = await this.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Error("Invalid user ID");
    }
    return this.chatRoom.findMany({
      where: {
        AND: [
          {
            status: { not: ChatRoomStatus.PRIVATE || ChatRoomStatus.DIALOGUE }
          },
          { members: { every: { member: { id: { not: userId } } } } },
          { createdAt: { lt: dateOldest } }
        ]
      },
      include: {
        owner: true,
        members: true
      },
      orderBy: { createdAt: "desc" },
      take: pageSize
    });
  }

  /**
   * This method returns a page of messages from the database of the specified size,
   * starting with the oldest message that is older than the date provided.
   *
   * @param id room id
   * @param date of the oldest message retrieved thus far
   * @param pageSize number of messages to return
   * @returns {Promise<MessageDto[]>} a page of messages
   */
  async getChatMessagesPage(
    id: number,
    date: Date,
    pageSize: number
  ): Promise<MessagePrismaType[]> {
    return this.message.findMany({
      where: {
        room: { id },
        createdAt: { lt: date }
      },
      include: {
        sender: {
          select: { username: true }
        },
        room: { select: { name: true } }
      },
      take: pageSize,
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Get a chat room ID by name.
   *
   * @param {string} roomName - The name of the chat room to search for.
   * @returns {Promise<number | null>} - A Promise that resolves to the ID of the chat room if found, or null if not found.
   */
  async getChatRoomId(roomName: string): Promise<number | null> {
    const room = await this.chatRoom.findUnique({
      where: { name: roomName }
    });
    return room ? room.id : null;
  }

  /**
   * Add a chat member to a chat room.
   *
   * @param {string} userId - The unique identifier of the user to be added to the chat room.
   * @param {number} roomId - The ID of the chat room to which the user should be added.
   * @param {ChatMemberRank} rank - The rank of the user in the chat room (e.g., "Admin", "Moderator", "Member").
   * @returns {Promise<ChatMember>} - A Promise that resolves to the newly created ChatMember object.
   */
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

  /**
   * Gets a chat room with its member
   *
   * @param {string} roomName
   * @param {string} username
   * @async
   * @returns {Promise<{ room: ChatRoom; chatMember: ChatMember } | null>}
   */
  async getChatRoomWithMember(
    roomName: string,
    username: string
  ): Promise<{ room: ChatRoom; chatMember: ChatMember } | null> {
    const roomWithMember = await this.chatRoom.findFirst({
      where: { name: roomName },
      include: {
        members: {
          where: { member: { username } }
        }
      }
    });

    if (!roomWithMember) {
      return null;
    }

    return {
      room: roomWithMember,
      chatMember: roomWithMember.members[0]
    };
  }

  /**
   * Updates a chat room
   *
   * @param {number} id
   * @param {Partial<UpdateChatRoomRequest>} req
   * @async
   * @returns {Promise<ChatRoom>}
   */
  async updateChatRoom(
    id: number,
    req: Partial<UpdateChatRoomRequest>
  ): Promise<ChatRoom> {
    if (!req.status || !req.roomName) {
      return;
    }
    const data: Prisma.ChatRoomCreateInput = {
      status: req.status,
      name: req.roomName,
      password: req.newPassword
    };
    return this.chatRoom.update({ where: { id }, data });
  }

  // Delete a chat room
  async deleteChatRoom(id: number): Promise<ChatRoomDto> {
    return this.chatRoom.delete({ where: { id } });
  }

  /**
   * Adds a message to a chat room
   *
   * @param {MessageDto} dto
   * @async
   * @returns {Promise<MessagePrismaType>}
   */
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

  /**
   * Retrieves the latest message in a chat room by room ID
   *
   * @param {number} roomId
   * @async
   * @returns {Promise<MessagePrismaType | null>}
   */
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
   * @returns {Promise<MatchPrismaType[]>}
   */
  async GetMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchPrismaType[]> {
    logger.log(getMatchHistoryRequest.username);
    return await this.match.findMany({
      where: {
        OR: [
          {
            player1: {
              username: getMatchHistoryRequest.username
            }
          },
          {
            player2: {
              username: getMatchHistoryRequest.username
            }
          }
        ]
      },
      include: {
        player1: true,
        player2: true
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
    logger.log(getProfileRequest.username);
    if (getProfileRequest.username === undefined || null) {
      logger.log("Username is undefined");
      throw new Error("Username is undefined");
    }
    return await this.user.findUnique({
      where: { username: getProfileRequest.username }
    });
  }

  async getUserbyMail(email: string): Promise<User> {
    if (email === undefined || null) {
      logger.log("Username is undefined");
      throw new Error("Username is undefined");
    }
    return await this.user.findUnique({
      where: { 
        email: email
      }
    });
  }


  /**
   * Returns a users friends from the database
   *
   * @todo make a primsa type for return
   * @param {GetFriendsRequest} getFriendsRequest
   * @async
   * @returns {Promise<Friend[]>}
   */
  //TODO: define a prisma type for the return
  async getFriends(getFriendsRequest: GetFriendsRequest): Promise<any[]> {
    logger.log(getFriendsRequest.username);
    const user = await this.user.findUnique({
      where: { username: getFriendsRequest.username },
      include: {
        friends: {
          include: {
            friend: true
          }
        }
      }
    });
    return user.friends;
  }

  /**
   * Adds a friend to the database
   *
   * @param {AddFriendRequest} addFriendRequest
   * @async
   * @returns {Promise<Friend>}
   */
  async addFriend(addFriendRequest: AddFriendRequest): Promise<boolean> {
    logger.log(
      `Adding friend ${addFriendRequest.friend} to ${addFriendRequest.username}`
    );
    try {
      return await this.$transaction(async () => {
        const userUpdated = await this.user.update({
          where: { username: addFriendRequest.username },
          data: {
            friends: {
              create: {
                friend: {
                  connect: { username: addFriendRequest.friend }
                }
              }
            }
          }
        });

        const friendUpdated = await this.user.update({
          where: { username: addFriendRequest.friend },
          data: {
            friends: {
              create: {
                friend: {
                  connect: { username: addFriendRequest.username }
                }
              }
            }
          }
        });

        if (userUpdated && friendUpdated) {
          return true;
        } else {
          return false;
        }
      });
    } catch (error) {
      logger.log(error);
      return false;
    }
  }

  /**
   * Updates a chat member's status
   *
   * @param {UpdateChatMemberRequest} updateDto
   * @async
   * @returns {Promise<ChatMember>}
   */
  async updateChatMemberStatus(
    updateDto: UpdateChatMemberRequest
  ): Promise<ChatMemberPrismaType> {
    try {
      const member = updateDto.memberToUpdateUuid
        ? await this.chatMember.findUnique({
            where: { id: updateDto.memberToUpdateUuid },
            include: { room: true }
          })
        : await this.getChatMemberByUsername(
            updateDto.roomName,
            updateDto.usernameToUpdate
          );
      if (!member) {
        throw new Error("User is not a member of this chatroom");
      }

      const newRank: ChatMemberRank = updateDto.memberToUpdateRank;
      const newStatus: ChatMemberStatus = updateDto.status;
      const futureDate = new Date(
        updateDto.duration === -1
          ? null
          : Date.now() + updateDto.duration * 60000
      );

      const updateData: Partial<ChatMember> = {
        status: newStatus,
        rank: newRank
      };

      switch (newStatus) {
        case ChatMemberStatus.OK:
          updateData.endOfBan = null;
          updateData.endOfMute = null;
          break;
        case ChatMemberStatus.MUTED:
          updateData.endOfMute = futureDate;
          break;
        case ChatMemberStatus.BANNED:
          updateData.endOfBan = futureDate;
          break;
        default:
          throw new Error("Unknown status");
      }

      const chatMember = await this.chatMember.update({
        where: { id: member.id },
        data: updateData,
        include: { member: true, room: true }
      });

      return chatMember;
    } catch (error) {
      throw new Error(`Failed to update member's status: ${error.message}`);
    }
  }

  /**
   * Fetches chat member by username and room name
   *
   * @param {string} roomName
   * @param {string} username
   * @async
   * @returns {Promise<ChatMember>}
   */
  async getChatMemberByUsername(
    roomName: string,
    username: string
  ): Promise<ChatMemberPrismaType> {
    const chatMember = await this.chatMember.findFirst({
      where: {
        AND: [
          {
            room: {
              name: { equals: roomName }
            }
          },
          {
            member: { username: { equals: username } }
          }
        ]
      },
      include: {
        member: {
          select: {
            avatar: true,
            username: true,
            status: true
          }
        },
        room: {
          select: {
            name: true
          }
        }
      }
    });

    if (!chatMember) {
      throw new Error(
        `Chat member not found for room '${roomName}' and username '${username}'.`
      );
    }

    return chatMember as ChatMemberPrismaType;
  }

  /**
   * Fetches chat member by username and room name
   *
   * @param {string} roomName
   * @param {string} uuid
   * @async
   * @returns {Promise<ChatMember>}
   */
  async getChatMemberByUUID(
    roomName: string,
    uuid: string
  ): Promise<ChatMemberPrismaType> {
    const chatMember = await this.chatMember.findFirst({
      where: {
        AND: [
          {
            room: {
              name: { equals: roomName }
            }
          },
          {
            memberId: { equals: uuid }
          }
        ]
      },
      include: {
        member: {
          select: {
            avatar: true,
            username: true,
            status: true
          }
        },
        room: {
          select: {
            name: true
          }
        }
      }
    });

    if (!chatMember) {
      throw new Error(
        `Chat member not found for room '${roomName}' and UUID '${uuid}'.`
      );
    }

    return chatMember as ChatMemberPrismaType;
  }

  /**
   * Gets a list of all users in the server that have not been blocked by the querying user,
   * and are not in the specified chat room
   *
   * @param {string} userId
   * @param {number} roomId
   * @async
   * @returns {Promise<User[]>}
   */
  async getAvailableUsers(userId: string, roomId: number): Promise<User[]> {
    if (!userId) {
      logger.error("User ID is undefined");
      throw new Error("User ID is undefined");
    }
    logger.warn(
      `getAvailableUsers request for user ${userId} in room ${roomId}`
    );
    // Get a list of users who blocked or have been blocked by the querying user
    const blockedUsers = await this.blockedUser.findMany({
      where: {
        OR: [
          {
            blockerId: userId
          },
          {
            blockedUserId: userId
          }
        ]
      }
    });
    const blockedIds = blockedUsers.map((user) =>
      user.blockerId === userId ? user.blockedUserId : user.blockerId
    );

    // Get a list of users who are not in the specified chat room
    const usersNotInRoom = roomId
      ? await this.chatMember.findMany({
          where: {
            roomId: roomId
          },
          select: {
            memberId: true
          }
        })
      : [];
    const usersNotInRoomIds = usersNotInRoom
      ? usersNotInRoom.map((user) => user.memberId)
      : [];

    logger.warn(`Blocked users:`, blockedIds);

    // Find users who are not in the blocked list and not in the specified room
    const availableUsers = await this.user.findMany({
      where: {
        id: {
          notIn: [...blockedIds, ...usersNotInRoomIds, userId]
        }
      }
    });
    logger.warn("Available users: " + availableUsers);

    return availableUsers;
  }

  /**
   * Check the status of a user in a chat room
   *
   * @param {number} userId
   * @param {string} roomName
   * @async
   * @returns {Promise<{ status: ChatMemberStatus; expiration: Date | null }>}
   */
  async checkChatMemberStatus(
    userId: string, // Changed from number to string to match your User model
    roomName: string
  ): Promise<{ status: ChatMemberStatus; expiration: Date | null }> {
    const chatMember = await this.chatMember.findFirst({
      where: {
        memberId: userId, // Changed from memberId to userId to match your ChatMember model
        room: {
          name: roomName
        }
      },
      select: {
        status: true, // Changed from chatMemberStatus to status to match your ChatMember model
        endOfMute: true // Changed from chatMemberStatusExpiration to endOfMute to match your ChatMember model
      }
    });

    return {
      status: chatMember?.status ?? ChatMemberStatus.OK,
      expiration: chatMember?.endOfMute ?? null
    };
  }

  /**
   * Deletes a chat member by their ID
   *
   * @param {number} id
   * @async
   * @returns {Promise<void>}
   */
  async destroyChatMember(id: number): Promise<void> {
    await this.chatMember.delete({
      where: { id }
    });
  }

  /**
   * Updates the avatar URL of a user by their username
   *
   * @param {string} userName
   * @param {string} URL
   * @async
   * @returns {Promise<void>}
   */
  async updateAvatar(userName: string, URL: string) {
    const userToUpdate = await this.user.update({
      where: {
        username: userName
      },
      data: {
        avatar: URL
      }
    });
    return userToUpdate;
  }

  /**
   * Adds a new Direct Message chat room between two users
   * @param {string} senderId
   * @param {string} recipientId
   * @async
   * @returns {Promise<ChatRoom>}
   * @throws {Error} If the chat room already exists
   */
  async createDirectMessageRoom(
    senderId: string,
    recipientId: string,
    roomName: string
  ): Promise<ChatRoom> {
    const newRoom = await this.chatRoom.create({
      data: {
        name: roomName,
        status: ChatRoomStatus.DIALOGUE,
        members: {
          create: [
            {
              member: {
                connect: { id: senderId }
              },
              rank: ChatMemberRank.USER,
              status: ChatMemberStatus.OK
            },
            {
              member: {
                connect: { id: recipientId }
              },
              rank: ChatMemberRank.USER,
              status: ChatMemberStatus.OK
            }
          ]
        }
      },
      include: { members: true }
    });

    return newRoom;
  }
}
