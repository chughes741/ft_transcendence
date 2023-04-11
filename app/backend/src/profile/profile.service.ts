import { Injectable, Logger } from "@nestjs/common";
import {
  AddFriendRequest,
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryItem,
  ProfileEntity,
  UpdateProfileRequest,
  UserStatus
} from "kingpong-lib";
import { PrismaService } from "src/prisma/prisma.service";
import { GetFriendsRequest } from "./profile.dto";

const logger = new Logger("ProfileService");

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}
  /**
   * Fetches match history of requested player
   *
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryItem[]>}
   */
  async getMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryItem[]> {
    if (!getMatchHistoryRequest.username) {
      logger.log("No username is provided");
      return [];
    }
    logger.log(`Fetching match history for ${getMatchHistoryRequest.username}`);
    /** Fetch match history from prisma service */
    const matches = await this.prismaService.GetMatchHistory(
      getMatchHistoryRequest
    );

    /** Map the return of prisma service to a MatchHistoryEntity */
    const matchHistory = matches.map((match) => {
      return {
        game_type: match.gameType,
        player1: match.player1.username,
        player2: match.player2.username,
        score_player1: match.scorePlayer1,
        score_player2: match.scorePlayer2,
        date: match.timestamp.toLocaleTimeString()
      };
    });

    return matchHistory;
  }

  /**
   * Fetches profile information from storage
   *
   * @param {GetProfileRequest} getProfileRequest
   * @async
   * @returns {Promise<ProfileEntity>}
   */
  async getProfile(
    getProfileRequest: GetProfileRequest
  ): Promise<ProfileEntity | null> {
    if (!getProfileRequest.username) {
      logger.log("No username is provided");
      return null;
    }
    logger.log(`Fetching profile for ${getProfileRequest.username}`);
    const user = await this.prismaService.GetProfile(getProfileRequest);
    const profile = {
      username: user.username,
      avatar: user.avatar,
      status:
        user.status === "ONLINE"
          ? UserStatus.ONLINE
          : user.status === "OFFLINE"
          ? UserStatus.OFFLINE
          : UserStatus.AWAY,
      createdAt: user.createdAt.toLocaleTimeString()
    };

    return profile;
  }

  /**
   * Get a list of all users friends
   *
   * @param {GetFriendsRequest} getFriendsRequest
   * @async
   * @returns {Promise<ProfileEntity[] | null>}
   */
  async getFriends(
    getFriendsRequest: GetFriendsRequest
  ): Promise<ProfileEntity[] | null> {
    if (!getFriendsRequest.username) {
      logger.log("No username is provided");
      return null;
    }
    logger.log(`Fetching friends for ${getFriendsRequest.username}`);
    const friends = await this.prismaService.getFriends(getFriendsRequest);
    const friendProfiles = friends.map((friend) => {
      return {
        username: friend.friend.username,
        avatar: friend.friend.avatar,
        status:
          friend.friend.status === "ONLINE"
            ? UserStatus.ONLINE
            : friend.friend.status === "OFFLINE"
            ? UserStatus.OFFLINE
            : UserStatus.AWAY,
        createdAt: friend.createdAt.toLocaleTimeString()
      };
    });

    return friendProfiles;
  }

  /**
   * Makes an update request to the database for a users profile
   *
   * @todo Implement
   * @param {UpdateProfileRequest} updateProfileRequest
   * @returns {boolean} - Update successful
   */
  updateProfile(updateProfileRequest: UpdateProfileRequest): boolean {
    logger.log(`Updating profile for ${updateProfileRequest.username}`);
    return true;
  }

  /**
   * Adds a friend to a users friend list
   *
   * @todo Implement
   * @param {AddFriendRequest} addFriendRequest
   * @returns {boolean} - Add successful
   */
  addFriend(addFriendRequest: AddFriendRequest): boolean {
    logger.log(`Adding friend ${addFriendRequest.friend} to ${addFriendRequest.username}`);
    return true;
  }
}
