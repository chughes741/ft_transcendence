import { Injectable } from "@nestjs/common";
import {
  FetchMatchHistoryEvent,
  FetchMatchHistoryReply,
  FetchProfileEvent,
  FetchProfileReply,
  UpdateProfileEvent,
  UserStatus
} from "kingpong-lib";

@Injectable()
export class ProfileService {
  /**
   * Fetches match history of requested player
   * 
   * @todo connect to prisma service
   * @param {FetchMatchHistoryEvent} fetchMatchHistoryEvent
   * @returns {MatchHistory}
   */
  fetchMatchHistory(
    fetchMatchHistoryEvent: FetchMatchHistoryEvent
  ): FetchMatchHistoryReply {
    const matchHistory = new FetchMatchHistoryReply();
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
   * @param {FetchProfileEvent} fetchProfileEvent
   * @returns {FetchProfileReply}
   */
  fetchProfile(fetchProfileEvent: FetchProfileEvent): FetchProfileReply {
    const profile = new FetchProfileReply();
    profile.profile = {
      username: "schlurp",
      avatar: "https://i.pravatar.cc/150",
      status: UserStatus.ONLINE,
      createdAt: "like three seconds ago, did you already forget?"
    };
    return profile;
  }

  /**
   * Makes an update request to the database for a users profile
   * 
   * @todo currently not implemented
   * @param {UpdateProfileEvent} updateProfileEvent
   * @returns {boolean} - Update successful
   */
  updateProfile(updateProfileEvent: UpdateProfileEvent): boolean {
    return true;
  }
}
