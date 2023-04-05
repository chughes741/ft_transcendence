import { Injectable } from "@nestjs/common";
import {
  CreateProfileEvent,
  CreateProfileReply,
  FetchMatchHistoryEvent,
  FetchMatchHistoryReply,
  UpdateProfileEvent
} from "kingpong-lib";
import { FetchProfileEvent, FetchProfileReply } from "./profile.dto";

@Injectable()
export class ProfileService {
  /**
   * Fetches match history of requested player
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
   * @param {FetchProfileEvent} fetchProfileEvent
   * @returns {FetchProfileReply}
   */
  fetchProfile(fetchProfileEvent: FetchProfileEvent): FetchProfileReply {
    const profile = new FetchProfileReply();
    profile.profile_name = "schlurp";
    return profile;
  }

  /**
   * @todo currently not implemented
   * @param {CreateProfileEvent} createProfileEvent
   * @returns {CreateProfileReply}
   */
  create(createProfileEvent: CreateProfileEvent): CreateProfileReply {
    return "This action adds a new profile";
  }

  /**
   * @todo currently not implemented
   * @returns
   */
  findAll() {
    return `This action returns all profile`;
  }

  /**
   * @todo currently not implemented
   * @param {number} id
   * @returns
   */
  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  /**
   * @todo currently not implemented
   * @param {number} id
   * @param {UpdateProfileEvent} updateProfileEvent
   * @returns
   */
  update(id: number, updateProfileEvent: UpdateProfileEvent) {
    return `This action updates a #${id} profile`;
  }

  /**
   * @todo currently not implemented
   * @param {number} id
   * @returns
   */
  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
