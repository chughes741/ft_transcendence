import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { ProfileService } from "./profile.service";
import {
  UpdateProfileDto,
  CreateProfileDto,
  FetchMatchHistoryDto
} from "./dto/profile.dto";
import { MatchHistoryEntity } from "./entities/profile.entity";

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
    @MessageBody() fetchMatchHistoryDto: FetchMatchHistoryDto
  ): MatchHistoryEntity {
    return this.profileService.fetchMatchHistory(fetchMatchHistoryDto);
  }

  @SubscribeMessage("createProfile")
  create(@MessageBody() createProfileDto: CreateProfileDto) {
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
  update(@MessageBody() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(updateProfileDto.id, updateProfileDto);
  }

  @SubscribeMessage("removeProfile")
  remove(@MessageBody() id: number) {
    return this.profileService.remove(id);
  }
}
