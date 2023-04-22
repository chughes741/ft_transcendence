import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { ImgTransferService } from "./imgtransfer.service";
import { ImgTransferController } from "./imgtransfer.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import TokenIsVerified from "src/token-verify";
import { TokenStorageService } from "src/token-storage.service";

@Module({
  imports: [
    MulterModule.register({
      dest: "src/images"
    }),
    PrismaModule
  ],
  controllers: [ImgTransferController],
  providers: [
    ImgTransferService,
    PrismaService,
    TokenIsVerified,
    TokenStorageService
  ]
})
export class ImgTransferModule {}
