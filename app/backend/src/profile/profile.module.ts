import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileGateway } from "./profile.gateway";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  providers: [ProfileGateway, ProfileService, PrismaService]
})
export class ProfileModule {}
