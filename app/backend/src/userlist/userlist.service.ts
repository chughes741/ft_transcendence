import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class UserlistService {
    constructor(private prisma: PrismaService) { }

    async getUserList(chatRoomName: string) {
        console.log("Inside getUserList");

/*
        const chat =  this.prisma.chatRoom.findUnique({
            where: { name: chatRoomName },
            include: { members: true } ,
        });*/
        const members = await this.prisma.getMembersByRoom(chatRoomName);
        
        if (members != null)
        {
            console.log("members not NULL");

            return members
        }
        console.log("members is NULL");
        
        const users = [
            { uuid: "000", nick: "Gwineth", email: "bitchplease@666.com", avatar: "goo.fuckyou" },
            { uuid: "007", nick: "James", email: "discreet101@double.com", avatar: "savethe.queen.org" },
            { uuid: "666", nick: "satan", email: "gotohell@inferno.inc", avatar: "PureEvil.disney+" },
            { uuid: "777", nick: "BobÉpine", email: "supaman@burine.org", avatar: "Poule" },
          ];
        
          

        return members;
    }
}
