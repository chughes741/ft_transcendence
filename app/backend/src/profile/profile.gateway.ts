import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryEntity,
  ProfileEntity,
  ProfileEvents,
  UpdateProfileRequest
} from "kingpong-lib";
import { ProfileService } from "./profile.service";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
   *
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryEntity>} - MatchHistoryItem[]
   */
  @SubscribeMessage(ProfileEvents.GetMatchHistory)
  async getMatchHistory(
    @MessageBody() getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryEntity> {
    return await this.profileService.getMatchHistory(getMatchHistoryRequest);
  }

  /**
   * Returns profile information to display on a profile page
   *
   * @param {GetProfileRequest} getProfileRequest
   * @async
   * @return {ProfileEntity} - Requested users profile
   */
  @SubscribeMessage(ProfileEvents.GetProfile)
  async getProfile(
    @MessageBody() getProfileRequest: GetProfileRequest
  ): Promise<ProfileEntity> {
    return await this.profileService.getProfile(getProfileRequest);
  }

  /**
   * Updates users profile information
   *
   * @param {UpdateProfileRequest} updateProfileRequest
   * @returns {boolean} - Update successful
   */
  @SubscribeMessage(ProfileEvents.UpdateProfile)
  updateProfile(
    @MessageBody() updateProfileRequest: UpdateProfileRequest
  ): boolean {
    return this.profileService.updateProfile(updateProfileRequest);
  }
}
