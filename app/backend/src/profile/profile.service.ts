import { Injectable, Logger } from "@nestjs/common";
import {
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
   * @todo update to return MatchHistoryEntity once kingpong-lib is updated
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryItem[]>}
   */
  async getMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryItem[]> {
    if (!getMatchHistoryRequest.id) {
      logger.log("No username is provided");
      return [];
    }
    logger.log(`Fetching match history for ${getMatchHistoryRequest.id}`);
    /** Fetch match history from prisma service */
    const matches = await this.prismaService.GetMatchHistory(
      getMatchHistoryRequest
    );

    /** Map the return of prisma service to a MatchHistoryEntity */
    const matchHistory = matches.map((match) => {
      return {
        match_type: match.gameType,
        players: match.player1Id + match.player2Id,
        results: match.scorePlayer1.toString() + match.scorePlayer2.toString(),
        date: match.timestamp.toLocaleTimeString(),
        winner: true
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
    if (!getProfileRequest.id) {
      logger.log("No username is provided");
      return null;
    }
    logger.log(`Fetching profile for ${getProfileRequest.id}`);
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
   * @todo update once kingpong-lib is updated
   * @param {GetFriendsRequest} getFriendsRequest
   * @async
   * @returns {Promise<ProfileEntity[]>}
   */
  async getFriends(
    getFriendsRequest: GetFriendsRequest
  ): Promise<ProfileEntity[]> {
    logger.log(`Fetching friends for ${getFriendsRequest.username}`);
    // const friends = await this.prismaService.getFriends(getFriendsRequest);
    // const friendProfiles = friends.map((friend) => {
    // return {
    // username: friend.username,
    // avatar: friend.avatar,
    // status: UserStatus.ONLINE,
    // createdAt: friend.createdAt.toLocaleTimeString()
    // };
    // });

    // return friendProfiles;

    return [];
  }

  /**
   * Makes an update request to the database for a users profile
   *
   * @param {UpdateProfileRequest} updateProfileRequest
   * @returns {boolean} - Update successful
   */
  updateProfile(updateProfileRequest: UpdateProfileRequest): boolean {
    return true;
  }
}
