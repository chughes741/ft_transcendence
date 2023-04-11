import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { ImgTransferService } from "./imgtransfer.service";
import { ImgTransferController } from "./imgtransfer.controller";

@Module({
    imports : [MulterModule.register({
        dest: '../images',
    })],
    controllers: [ImgTransferController],
    providers : [ImgTransferService]

})

export class ImgTransferModule {}