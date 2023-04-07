import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { ChatMemberPrismaType } from 'src/chat/chat.gateway';
import { ChatMemberEntity } from './userlist.gateway';


@Injectable()
export class UserlistService {
    constructor(private readonly prisma: PrismaService) { }

    async getUserList(chatRoomName: string) : Promise<ChatMemberEntity[]> {
        console.log("Inside getUserList");

      
        //get all users that are members of a specific Chat Room (with string name)
        const userMembers : ChatMemberPrismaType[] = await this.prisma.getRoomMembers(chatRoomName);
        const CMEntities : ChatMemberEntity[] = userMembers.map( (chatMembers) => {
            return {
              username : chatMembers.member.username,
              id : chatMembers.id,
              status : chatMembers.status,
              rank : chatMembers.rank,
              endOfBan : chatMembers.endOfBan,
              endOfMute : chatMembers.endOfMute,
            }
          })
        console.log("ENTITIES" , CMEntities);
        if (userMembers.length > 0)
        {
            console.log ("First member in " , CMEntities[0])
            return CMEntities
        }
        console.log("There is no members in room");
        return [];
    }
}
