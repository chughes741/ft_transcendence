import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import {
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryItem,
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
   * @todo update to return MatchHistoryEntity once kingpong-lib is updated
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryEntity>} - MatchHistoryItem[]
   */
  @SubscribeMessage(ProfileEvents.GetMatchHistory)
  async getMatchHistory(
    @MessageBody() getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryItem[]> {
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
