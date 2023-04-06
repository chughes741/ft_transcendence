import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { ProfileService } from "./profile.service";
import {
  FetchMatchHistoryEvent,
  FetchMatchHistoryReply,
  FetchProfileEvent,
  FetchProfileReply,
  UpdateProfileEvent,
  UpdateProfileReply
} from "kingpong-lib";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
   *
   * @param {FetchMatchHistoryEvent} fetchMatchHistoryEvent
   * @returns {MatchHistory} - Array of MatchHistoryItem
   */
  @SubscribeMessage("fetchMatchHistory")
  fetchMatchHistory(
    @MessageBody() fetchMatchHistoryEvent: FetchMatchHistoryEvent
  ): FetchMatchHistoryReply {
    return this.profileService.fetchMatchHistory(fetchMatchHistoryEvent);
  }

  /**
   * Returns profile information to display on a profile page
   *
   * @param {FetchProfileEvent} fetchProfileEvent
   * @return {FetchProfileReply} - Requested users profile
   */
  @SubscribeMessage("fetchProfile")
  fetchProfile(
    @MessageBody() fetchProfileEvent: FetchProfileEvent
  ): FetchProfileReply {
    return this.profileService.fetchProfile(fetchProfileEvent);
  }

  /**
   * Updates users profile information
   *
   * @param {UpdateProfileEvent} updateProfileEvent
   * @returns {boolean} - Update successful
   */
  @SubscribeMessage("updateProfile")
  updateProfile(
    @MessageBody() updateProfileEvent: UpdateProfileEvent
  ): boolean {
    return this.profileService.updateProfile(updateProfileEvent);
  }
}
