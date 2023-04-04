import { Injectable } from "@nestjs/common";
import { CreateProfileDto, FetchMatchHistoryDto } from "./dto/profile.dto";
import { UpdateProfileDto } from "./dto/profile.dto";
import { MatchHistoryEntity } from "./entities/profile.entity";

@Injectable()
export class ProfileService {
  /**
   * Fetches match history of requested player
   * @param {FetchMatchHistoryDto} fetchMatchHistoryDto
   * @returns {MatchHistory}
   */
  fetchMatchHistory(
    fetchMatchHistoryDto: FetchMatchHistoryDto
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

  create(createProfileDto: CreateProfileDto) {
    return "This action adds a new profile";
  }

  findAll() {
    return `This action returns all profile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
