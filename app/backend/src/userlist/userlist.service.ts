import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class UserlistService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserList(chatRoomName: string) {
        console.log("Inside getUserList");

        //get all users that are members of a specific Chat Room (with string name)
        const userMembers = await this.prisma.getMembersByRoom(chatRoomName); 
        
        if (userMembers.length > 0)
        {
            console.log("members not NULL");
            return userMembers
        }
        console.log("members is NULL");
        
        const users = [
            { uuid: "000", nick: "Gwineth", email: "bitchplease@666.com", avatar: "goo.fuckyou" },
            { uuid: "007", nick: "James", email: "discreet101@double.com", avatar: "savethe.queen.org" },
            { uuid: "666", nick: "satan", email: "gotohell@inferno.inc", avatar: "PureEvil.disney+" },
            { uuid: "777", nick: "BobÉpine", email: "supaman@burine.org", avatar: "Poule" },
          ];
        
          

        return users;
    }
}
