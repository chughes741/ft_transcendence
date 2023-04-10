import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { MulterModule } from "@nestjs/platform-express";
import { ImgTransferGateway } from "./imgtransfer.gateway";
import { ImgTransferService } from "./imgtransfer.service";

@Module({
    imports : [PrismaModule, MulterModule],
    providers : [ImgTransferService, ImgTransferGateway]

})

export class ImgTransferModule {}