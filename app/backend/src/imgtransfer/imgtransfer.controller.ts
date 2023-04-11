import { Body, Controller, Injectable, UploadedFile } from "@nestjs/common";
import { ConnectedSocket } from "@nestjs/websockets";
import { Post } from "@nestjs/common";
import { Socket } from "dgram";
import { Express } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { UseInterceptors } from "@nestjs/common";
import { diskStorage } from "multer";
import { HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';

const imageFileFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname);
    if (extname.match(/\.(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
    } else {
        cb(new HttpException('Invalid file type', HttpStatus.BAD_REQUEST), false);
    }
};



@Controller('imgtransfer')
export class ImgTransferController {

    @Post('noupload')
    public async printConsole() {
        console.log("MESSSAGE RECEIVED")
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: 'src/images',
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            },
        }),
        fileFilter: imageFileFilter,
    }))

    public async uploadUserImage(@UploadedFile() file: Express.Multer.File) {
        const data = {
            Name: file.originalname,
            fileName: file.filename,
        }

        console.log(data)
        console.log("received ?");
        return ('Potential Success')
    }
}