import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { ProfileService } from "./profile.service";
import {
  CreateProfileEvent,
  FetchMatchHistoryEvent,
  FetchMatchHistoryReply,
  UpdateProfileEvent
} from "kingpong-lib";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
   * @param {FetchMatchHistoryDto} fetchMatchHistoryDto -
   * @returns {MatchHistory} - Array of MatchHistoryItem
   */
  @SubscribeMessage("fetchMatchHistory")
  fetchMatchHistory(
    @MessageBody() fetchMatchHistoryDto: FetchMatchHistoryEvent
  ): FetchMatchHistoryReply {
    return this.profileService.fetchMatchHistory(fetchMatchHistoryDto);
  }

  @SubscribeMessage("createProfile")
  create(@MessageBody() createProfileDto: CreateProfileEvent) {
    return this.profileService.create(createProfileDto);
  }

  @SubscribeMessage("findAllProfile")
  findAll() {
    return this.profileService.findAll();
  }

  @SubscribeMessage("findOneProfile")
  findOne(@MessageBody() id: number) {
    return this.profileService.findOne(id);
  }

  @SubscribeMessage("updateProfile")
  update(@MessageBody() updateProfileDto: UpdateProfileEvent) {
    return this.profileService.update(updateProfileDto.id, updateProfileDto);
  }

  @SubscribeMessage("removeProfile")
  remove(@MessageBody() id: number) {
    return this.profileService.remove(id);
  }
}
