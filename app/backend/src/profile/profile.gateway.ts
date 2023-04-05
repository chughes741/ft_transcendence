import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { ProfileService } from "./profile.service";
import {
  CreateProfileEvent,
  CreateProfileReply,
  FetchMatchHistoryEvent,
  FetchMatchHistoryReply,
  UpdateProfileEvent,
  UpdateProfileReply
} from "kingpong-lib";
import { FetchProfileEvent, FetchProfileReply } from "./profile.dto";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Gateway for requesting a players match history
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
   * @param {FetchProfileEvent} fetchProfileEvent
   * @return {FetchProfileReply}
   */
  @SubscribeMessage("fetchProfile")
  fetchProfile(@MessageBody() fetchProfileEvent: FetchProfileEvent): FetchProfileReply {
    return this.profileService.fetchProfile(fetchProfileEvent);
  }

  /**
   * @todo currently not implemented
   * @param {CreateProfileEvent} createProfileEvent
   * @returns {CreateProfileReply}
   */
  @SubscribeMessage("createProfile")
  create(
    @MessageBody() createProfileEvent: CreateProfileEvent
  ): CreateProfileReply {
    return this.profileService.create(createProfileEvent);
  }

  /**
   * @todo currently not implemented
   * @returns {void}
   */
  @SubscribeMessage("findAllProfile")
  findAll() {
    return this.profileService.findAll();
  }

  /**
   * @todo currently not implemented
   * @param {number} id
   * @returns {void}
   */
  @SubscribeMessage("findOneProfile")
  findOne(@MessageBody() id: number) {
    return this.profileService.findOne(id);
  }

  /**
   * @todo currently not implemented
   * @param {UpdateProfileEvent} updateProfileEvent
   * @returns {UpdateProfileReply}
   */
  @SubscribeMessage("updateProfile")
  update(
    @MessageBody() updateProfileEvent: UpdateProfileEvent
  ): UpdateProfileReply {
    return this.profileService.update(
      updateProfileEvent.id,
      updateProfileEvent
    );
  }

  /**
   * @todo currently not implemented
   * @param {number} id
   * @returns {void}
   */
  @SubscribeMessage("removeProfile")
  remove(@MessageBody() id: number) {
    return this.profileService.remove(id);
  }
}
