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
import { UseGuards } from "@nestjs/common";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { Socket } from "dgram";

/**
 * Gateway for profile related requests
 */
@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
   *
   * @listens ProfileEvents.GetMatchHistory
   * @param {GetMatchHistoryRequest} getMatchHistoryRequest
   * @returns {Promise<MatchHistoryItem[]>} - Requested users match history
   */
  @SubscribeMessage(ProfileEvents.GetMatchHistory)
  @UseGuards(TokenIsVerified)
  async getMatchHistory(
    client: Socket,
    @MessageBody() getMatchHistoryRequest: GetMatchHistoryRequest
  ): Promise<MatchHistoryItem[]> {
    return await this.profileService.getMatchHistory(getMatchHistoryRequest);
  }

  /**
   * Returns profile information to display on a profile page
   *
   * @listens ProfileEvents.GetProfile
   * @param {GetProfileRequest} getProfileRequest
   * @return {Promise<ProfileEntity | null>} - Requested users profile
   */
  @SubscribeMessage(ProfileEvents.GetProfile)
  @UseGuards(TokenIsVerified)
  async getProfile(
    client: Socket,
    @MessageBody() getProfileRequest: GetProfileRequest
  ): Promise<ProfileEntity | null> {
    return await this.profileService.getProfile(getProfileRequest);
  }

  /**
   * Returns profile information of users friends
   *
   * @todo add getFriendsRequest to kingpong-lib
   * @listens "getFriendsRequest"
   * @param {GetFriendsRequest} getFriendsRequest
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
   * @listens ProfileEvents.UpdateProfile
   * @param {UpdateProfileRequest} updateProfileRequest
   * @returns {boolean} - Update successful
   */
  @SubscribeMessage(ProfileEvents.UpdateProfile)
  @UseGuards(TokenIsVerified)
  updateProfile(
    client: Socket,
    @MessageBody() updateProfileRequest: UpdateProfileRequest
  ): boolean {
    return this.profileService.updateProfile(updateProfileRequest);
  }

  /**
   * Add a friend to a users friend list
   *
   * @listens ProfileEvents.AddFriend
   * @param {AddFriendRequest} addFriendRequest
   * @returns {boolean} - Add friend successful
   */
  @SubscribeMessage(ProfileEvents.AddFriend)
  @UseGuards(TokenIsVerified)
  addFriend(
    client: Socket,
    @MessageBody() addFriendRequest: AddFriendRequest
  ): Promise<boolean> {
    return this.profileService.addFriend(addFriendRequest);
  }
}
