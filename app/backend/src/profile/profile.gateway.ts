import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import {
  AddFriendRequest,
  GetMatchHistoryRequest,
  GetProfileRequest,
  MatchHistoryItem,
  ProfileEntity,
  ProfileEvents,
  UpdateProfileRequest
} from "kingpong-lib";
import { ProfileService } from "./profile.service";
import { GetFriendsRequest } from "./profile.dto";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
   *
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @async
   * @returns {Promise<MatchHistoryItem[]>}
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
   * @return {Promise<ProfileEntity | null>} - Requested users profile
   */
  @SubscribeMessage(ProfileEvents.GetProfile)
  async getProfile(
    @MessageBody() getProfileRequest: GetProfileRequest
  ): Promise<ProfileEntity | null> {
    return await this.profileService.getProfile(getProfileRequest);
  }

  /**
   * Returns profile information of users friends
   *
   * @param {GetFriendsRequest} getFriendsRequest
   * @async
   * @returns {Promise<ProfileEntity[] | null>} - Requested users friends
   */
  @SubscribeMessage("getFriendsRequest")
  async getFriends(
    @MessageBody() getFriendsRequest: GetFriendsRequest
  ): Promise<ProfileEntity[] | null> {
    return await this.profileService.getFriends(getFriendsRequest);
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

  /**
   * Add a friend to a users friend list
   *
   * @param {AddFriendRequest} addFriendRequest
   * @returns {boolean} - Add friend successful
   */
  @SubscribeMessage(ProfileEvents.AddFriend)
  addFriend(
    @MessageBody() addFriendRequest: AddFriendRequest
  ): Promise<boolean> {
    return this.profileService.addFriend(addFriendRequest);
  }
}
