import { Injectable } from "@nestjs/common";
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryEntity,
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
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryEntity>}
   */
  async getMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryEntity> {
    return await this.prismaService.GetMatchHistory(getMatchHistoryRequest);
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
