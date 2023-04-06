import { Injectable } from "@nestjs/common";
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryEntity,
  ProfileEntity,
  UpdateProfileRequest,
  UserStatus
} from "kingpong-lib";

@Injectable()
export class ProfileService {
  /**
   * Fetches match history of requested player
   *
   * @todo connect to prisma service
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @returns {MatchHistoryEntity}
   */
  getMatchHistory(
    getMatchHistoryRequest: GetMatchHistoryRequest
  ): MatchHistoryEntity {
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
   * Fetches profile information from storage
   *
   * @todo connect to prisma service
   * @param {GetProfileRequest} getProfileRequest
   * @returns {ProfileEntity}
   */
  getProfile(getProfileRequest: GetProfileRequest): ProfileEntity {
    const profile = new ProfileEntity();
    profile.username = "schlurp";
    profile.avatar = "https://i.pravatar.cc/150";
    profile.status = UserStatus.ONLINE;
    profile.createdAt = "like three seconds ago, did you already forget?";
    return profile;
  }

  /**
   * Makes an update request to the database for a users profile
   *
   * @todo currently not implemented
   * @param {UpdateProfileRequest} updateProfileRequest
   * @returns {boolean} - Update successful
   */
  updateProfile(updateProfileRequest: UpdateProfileRequest): boolean {
    return true;
  }
}
