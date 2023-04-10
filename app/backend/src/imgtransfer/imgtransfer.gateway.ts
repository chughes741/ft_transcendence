import { Body, Injectable, UploadedFile } from "@nestjs/common";
import { ConnectedSocket  } from "@nestjs/websockets";
import { Post } from "@nestjs/common";
import { Socket } from "dgram";
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";


@Injectable()
export class ImgTransferGateway {

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async handleUpload(@UploadedFile() file: Express.Multer.File) {
        console.log(file)
        console.log("received ?");
    }
}