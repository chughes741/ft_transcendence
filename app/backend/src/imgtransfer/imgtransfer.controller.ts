import { Body, Controller, Get, Injectable, UploadedFile } from "@nestjs/common";
import { ConnectedSocket } from "@nestjs/websockets";
import { Post } from "@nestjs/common";
import { Socket } from "dgram";
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import { diskStorage } from "multer";
import { HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import { ImgTransferService } from "./imgtransfer.service";
import { findIndex } from "rxjs";

const imageFileFilter = (req, file, cb) => {
    
    const extname = path.extname(file.originalname);
    
    if (extname.match(/\.(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
    } else {
        cb(new HttpException('Invalid file type', HttpStatus.BAD_REQUEST), false);
    }
};

@Injectable()
@Controller('imgtransfer')
export class ImgTransferController {
    constructor(private imgtransferService : ImgTransferService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: 'img',
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            },
        }),
        fileFilter: imageFileFilter,
    }))
    public async uploadUserImage(@UploadedFile() file: Express.Multer.File) {
        const baseUrl = process.env.SITE_URL + 'img/';
        const url = require('url');
        const imageUrl = url.resolve(baseUrl, file.filename);
        console.log(baseUrl);
        const data = {
            Name: file.originalname,
            fileName: file.filename,
            URL : imageUrl,
        }
        this.imgtransferService.updateProfilePic('schlurp', data);
        console.log(data)
        return (imageUrl)
    }

}