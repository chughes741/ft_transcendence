import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { ImgTransferService } from "./imgtransfer.service";
import { ImgTransferController } from "./imgtransfer.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import TokenIsVerified from "src/tokenstorage/token-verify.service";
import { TokenModule } from "src/tokenstorage/token-verify.module";
import { TokenStorageModule } from "src/tokenstorage/token-storage.module";

@Module({
  imports: [
    MulterModule.register({
      dest: "src/images"
    }),
    PrismaModule,
    TokenModule,
  ],
  controllers: [ImgTransferController],

  providers: [
    ImgTransferService,
    PrismaService,
  ]
})
export class ImgTransferModule {}
