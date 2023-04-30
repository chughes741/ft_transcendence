import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileGateway } from "./profile.gateway";
import { PrismaService } from "src/prisma/prisma.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";

@Module({
  imports: [TokenModule, TokenStorageModule],
  providers: [ProfileGateway, ProfileService, PrismaService]
})
export class ProfileModule {}
