import { Injectable, Logger } from "@nestjs/common";
import {
  BlockedUser,
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
import config from "../config";

import {
  AddFriendRequest,
  GetFriendsRequest,
  GetMatchHistoryRequest,
  GetProfileRequest
} from "kingpong-lib";

import { UpdateChatMemberRequest } from "src/chat/dto/userlist.dto";
import { UserEntity } from "../auth/dto";
import { MatchType } from "../game/game.types";
import {
  ChatMemberPrismaType,
  MessagePrismaType,
  UpdateChatRoomRequest
} from "../chat/chat.types";

const logger = new Logger("PrismaService");

/** @todo needs to be in kingpong-lib */
interface MatchPrismaType extends Match {
  player1: User;
  player2: User;
}

/**
 * PrismaService class
 */
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
   *
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
   *
   * @param {string} userId - The id of the user.
   * @returns {Promise<boolean>} - A Promise that resolves to true if the user exists, false otherwise.
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

  /**
   * Checks if a user with the given username exists in the database.
   *
   * @param {string} username - The username of the user.
   * @returns {Promise<boolean>} - A Promise that resolves to true if the user exists, false otherwise.
   */
  async userNameExists(username: string): Promise<boolean> {
    if (!username) {
      logger.error("userExists: User username is required");
      return false;
    }

    try {
      const user = await this.user.findUnique({
        where: { username: username }
      });
      return !!user;
    } catch (err) {
      return false;
    }
  }

  /**
   * Checks if a user with the given email exists in the database.
   *
   * @param {string} userName - The username of the user.
   * @param {string} newUsername - The new username of the user.
   * @returns {Promise<boolean>} - A Promise that resolves to true if the username was changed, false otherwise.
   */
  async changeUserName(
    userName: string,
    newUsername: string
  ): Promise<boolean> {
    const nameExists = await this.userNameExists(newUsername);
    if (nameExists) return false;
    await this.user.update({
      where: {
        username: userName
      },
      data: {
        username: newUsername
      }
    });
    return true;
  }

  /**
   * Gets the user id of a user with the specified nick.
   *
   * @param {string} nick - The user's nick.
   * @returns {Promise<string>} - A Promise that resolves to the user id if the user is found, or an error if not found.
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
   * Returns a list of `limit` chat rooms members, including their username and avatar.
   *
   * @param {string} roomName - The name of the room.
   * @param {number} limit - The maximum number of members to return.
   * @returns {Promise<ChatMemberPrismaType[]>} - A Promise that resolves to the chat members if the room is found, or an error if not found.
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
   *
   * @param req - dto containing the room name and the user id
   * @returns {Promise<User>} - A Promise that resolves to the chat member if the user is found, or an error if not found.
   */
  async addUser(req: UserEntity): Promise<User> {
    logger.debug(`addUser:`, req);
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
   *
   * @param {ChatRoomDto} dto - The data transfer object containing the chat room data.
   * @returns {Promise<ChatRoom>} - A Promise that resolves to the created chat room.
   */
  async createChatRoom(dto: ChatRoomDto): Promise<ChatRoom> {
    // Check if the owner UUID is valid
    /** @todo this should use the userExists() method */
    /** @todo remove this code when authentication is enabled */
    logger.debug(`dto.owner: ${dto.owner}`);
    const userID = await this.getUserIdByNick(dto.owner);
    logger.debug(`userID: ${userID}`);
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
   * @param {Date} [dateOldest=new Date()] - The date of the oldest chat room retrieved thus far. Defaults to the current date and time.
   * @param {number} [pageSize=15] - The number of chat rooms to return. Defaults to 15.
   * @returns {Promise<any>} - A Promise that resolves to an array of chat rooms.
   */
  async getAvailableChatRooms(
    userId: string,
    dateOldest: Date = new Date(),
    pageSize = 50
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
    const rooms = await this.chatRoom.findMany({
      where: {
        AND: [
          {
            status: {
              notIn: [ChatRoomStatus.PRIVATE, ChatRoomStatus.DIALOGUE]
            }
          },
          { members: { none: { member: { id: userId } } } },
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
    return rooms;
  }

  /**
   * This method returns a page of messages from the database of the specified size,
   * starting with the oldest message that is older than the date provided.
   *
   * @param {number} id - The ID of the chat room to retrieve messages from.
   * @param {Date} date - The date of the oldest message retrieved thus far.
   * @param {number} pageSize - The number of messages to return.
   * @returns {Promise<MessagePrismaType[]>} - A Promise that resolves to an array of messages.
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
   * @todo Fix this functions return type
   *
   * @param {string} roomName - The name of the chat room
   * @param {string} username - The username of the member
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
   * @param {number} id - The id of the chat room
   * @param {Partial<UpdateChatRoomRequest>} req - The request body
   * @returns {Promise<ChatRoom>} - A Promise that resolves to the updated chat room
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

  /**
   * Deletes a chat room
   *
   * @param {number} id - The id of the chat room
   * @returns {Promise<ChatRoomDto>} - A Promise that resolves to the deleted chat room
   */
  async deleteChatRoom(id: number): Promise<ChatRoomDto> {
    return this.chatRoom.delete({ where: { id } });
  }

  /**
   * Adds a message to a chat room
   *
   * @param {MessageDto} dto
   * @returns {Promise<MessagePrismaType>} - A Promise that resolves to the newly created message
   */
  async addMessageToChatRoom(dto: MessageDto): Promise<MessagePrismaType> {
    // Check if the owner UUID is valid
    const userExists = await this.userExists(dto.senderId);
    if (dto.senderId && !userExists) {
      logger.debug(`userExists: ${userExists}`);
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
   * @param {number} roomId - The ID of the chat room
   * @returns {Promise<MessagePrismaType | null>} - A Promise that resolves to the latest message in the chat room, or null if no messages exist
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
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest - The request body
   * @returns {Promise<MatchPrismaType[]>} - A Promise that resolves to the match history
   */
  async GetMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchPrismaType[]> {
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
   * @param {GetProfileRequest} getProfileRequest - The request body
   * @returns {Promise<User>} - A Promise that resolves to the user profile
   */
  async GetProfile(getProfileRequest: GetProfileRequest): Promise<User> {
    if (getProfileRequest.username === undefined || null) {
      throw new Error("Username is undefined");
    }
    return await this.user.findUnique({
      where: { username: getProfileRequest.username }
    });
  }

  async getUserbyMail(email: string): Promise<User> {
    if (email === undefined || null) {
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
   *
   * @param {GetFriendsRequest} getFriendsRequest - The request body
   * @returns {Promise<any[]>} - A Promise that resolves to the user's friends
   */
  //TODO: define a prisma type for the return
  async getFriends(getFriendsRequest: GetFriendsRequest): Promise<any[]> {
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
   * @param {AddFriendRequest} addFriendRequest - The request body
   * @returns {Promise<boolean>} - A Promise that resolves to true if the friend was added successfully, false otherwise
   */
  async addFriend(addFriendRequest: AddFriendRequest): Promise<boolean> {
    logger.debug(
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
      logger.error(error);
      return false;
    }
  }

  /**
   * Updates a chat member's status
   *
   * @param {UpdateChatMemberRequest} updateDto - The request body
   * @returns {Promise<ChatMemberPrismaType>} - A Promise that resolves to the updated chat member
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
   * @param {string} roomName - The room name
   * @param {string} username - The username
   * @returns {Promise<ChatMemberPrismaType>} - A Promise that resolves to the chat member
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
   * @param {string} roomName - The room name
   * @param {string} uuid - The uuid
   * @returns {Promise<ChatMemberPrismaType>} - A Promise that resolves to the chat member
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
   * @param {string} userId - The querying user's ID
   * @param {number} roomId - The chat room ID
   * @returns {Promise<User[]>} - A Promise that resolves to a list of users
   */
  async getAvailableUsers(userId: string, roomId: number): Promise<User[]> {
    if (!userId) {
      throw new Error("User ID is undefined");
    }
    logger.debug(
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

    logger.debug(`Blocked users:`, blockedIds);

    // Find users who are not in the blocked list and not in the specified room
    const availableUsers = await this.user.findMany({
      where: {
        id: {
          notIn: [...blockedIds, ...usersNotInRoomIds, userId]
        }
      }
    });
    logger.debug("Available users: " + availableUsers);

    return availableUsers;
  }

  /**
   * Check the status of a user in a chat room
   *
   * @todo Fix this functions return type
   *
   * @param {string} userId - The user ID
   * @param {string} roomName - The room name
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
   * @param {number} id - The chat member ID
   * @returns {Promise<void>} - A Promise that resolves when the chat member is deleted
   */
  async destroyChatMember(id: number): Promise<void> {
    await this.chatMember.delete({
      where: { id }
    });
  }

  /**
   * Updates the avatar URL of a user by their username
   *
   * @param {string} userName - The username
   * @param {string} URL - The avatar URL
   * @returns {Promise<void>} - A Promise that resolves when the user is updated
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
   * Updates the status of a user by their username
   *
   * @param {string} userName - The username
   * @returns {Promise<void>} - A Promise that resolves when the user is updated
   */
  async update2FA(userName: string): Promise<boolean> {
    const user = await this.user.findUnique({
      where: {
        username: userName
      }
    });
    if (user.enable2fa === true) {
      await this.user.update({
        where: {
          username: userName
        },
        data: {
          enable2fa: false
        }
      });
      return false;
    } else {
      await this.user.update({
        where: {
          username: userName
        },
        data: {
          enable2fa: true
        }
      });
    }
    return true;
  }

  /**
   * Adds a new Direct Message chat room between two users
   *
   * @param {string} senderId - The sender's ID
   * @param {string} recipientId - The recipient's ID
   * @param {string} roomName - The room name
   * @returns {Promise<ChatRoom>} - A Promise that resolves to the new chat room
   *
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

  /**
   * Adds a blocked user relationship between two users.
   *
   * @param {string} blockingId - The ID of the user doing the blocking.
   * @param {string} blockedId - The ID of the user being blocked.
   * @returns {Promise<BlockedUser>} - A Promise that resolves to the new blocked user relationship.
   */
  async addBlockedUser(
    blockingId: string,
    blockedId: string
  ): Promise<BlockedUser> {
    return await this.blockedUser.create({
      data: {
        blocker: {
          connect: { id: blockingId }
        },
        blocked: {
          connect: { id: blockedId }
        }
      }
    });
  }

  /**
   * Removes a blocked user relationship between two users.
   *
   * @param {string} blockingId - The ID of the user who did the blocking.
   * @param {string} blockedId - The ID of the user who was blocked.
   * @returns {Promise<void>} - A Promise that resolves when the blocked user relationship is removed.
   */
  async removeBlockedUser(
    blockingId: string,
    blockedId: string
  ): Promise<void> {
    await this.blockedUser.delete({
      where: {
        blockerId_blockedUserId: {
          blockerId: blockingId,
          blockedUserId: blockedId
        }
      }
    });
  }

  /**
   * Retrieves the users blocked by a user.
   *
   * @param {string} userId - The ID of the user who did the blocking.
   * @returns {Promise<User[]>} - A Promise that resolves to an array of users who were blocked by the user.
   */
  async getUsersBlockedBy(userId: string): Promise<User[]> {
    const blockedUserRelations = await this.blockedUser.findMany({
      where: {
        blockerId: userId
      },
      select: {
        blocked: true
      }
    });

    const blockedUsers = blockedUserRelations.map(
      (relation) => relation.blocked
    );
    return blockedUsers;
  }

  /**
   * Retrieves the users blocking a user.
   *
   * @param {string} userId - The ID of the user who was blocked.
   * @returns {Promise<User[]>} - A Promise that resolves to an array of users who did the blocking.
   */
  async getUsersBlocking(userId: string): Promise<User[]> {
    const blockingUserRelations = await this.blockedUser.findMany({
      where: {
        blockedUserId: userId
      },
      select: {
        blocker: true
      }
    });

    const blockingUsers = blockingUserRelations.map(
      (relation) => relation.blocker
    );
    return blockingUsers;
  }

  /**
   * Checks if a user is blocked by another user.
   *
   * @param {string} blockerId - The ID of the user who did the blocking.
   * @param {string} blockedUserId - The ID of the user who was blocked.
   * @returns {Promise<boolean>} - A Promise that resolves to true if the user is blocked by the other user, false otherwise.
   */
  async checkIfBlocked(
    blockerId: string,
    blockedUserId: string
  ): Promise<boolean> {
    const blockedUser = await this.blockedUser.findFirst({
      where: {
        blockerId: blockerId,
        blockedUserId: blockedUserId
      }
    });

    return !!blockedUser;
  }

  /**
   * Add a match to the database
   *
   * @todo fix this wonky parameter list
   *
   * @param {string} player1Id - The ID of the first player
   * @param {string} player2Id - The ID of the second player
   * @param {number} scorePlayer1 - The score of the first player
   * @param {number} scorePlayer2 - The score of the second player
   * @param {Date} timestamp - The timestamp of the match
   * @param {GameType} gameType - The game type of the match
   * @returns {Promise<Match>} - A Promise that resolves to the new match
   */
  async addMatch({
    player1Id,
    player2Id,
    scorePlayer1,
    scorePlayer2,
    timestamp,
    gameType
  }: MatchType): Promise<Match> {
    const newMatch = await this.match.create({
      data: {
        player1: {
          connect: { id: player1Id }
        },
        player2: {
          connect: { id: player2Id }
        },
        scorePlayer1,
        scorePlayer2,
        timestamp,
        gameType
      }
    });

    return newMatch;
  }

  async setQrCode(name: string, code: string): Promise<User> {
    return await this.user.update({
      where: {
        username: name
      },
      data: {
        qrcode: code
      }
    });
  }

  async getQrCode(name: string): Promise<string> {
    const user = await this.user.findUnique({
      where: {
        username: name
      }
    });
    return user.qrcode;
  }

  async getEnable2Fa(name: string): Promise<boolean> {
    const user = await this.user.findUnique({
      where: {
        username: name
      }
    });
    return user.enable2fa;
  }
}
