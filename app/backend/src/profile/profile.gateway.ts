import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@WebSocketGateway()
export class ProfileGateway {
  constructor(private readonly profileService: ProfileService) {}

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
