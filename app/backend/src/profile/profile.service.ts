import { Injectable } from "@nestjs/common";
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryItem,
  ProfileEntity,
  UpdateProfileRequest
} from "kingpong-lib";
import { PrismaService } from "src/prisma/prisma.service";

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
  ): Promise<ProfileEntity> {
    return await this.prismaService.GetProfile(getProfileRequest);
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
