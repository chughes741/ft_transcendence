import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileGateway } from "./profile.gateway";

@Module({
  providers: [ProfileGateway, ProfileService],
})
export class ProfileModule {}
