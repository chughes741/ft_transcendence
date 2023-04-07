import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { ChatMemberPrismaType } from 'src/chat/chat.gateway';
import { ChatMemberEntity } from './userlist.gateway';
import { updateChatMemberStatusDto } from './dto/userlist.dto';


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
              chatMemberstatus : chatMembers.status,
              userStatus : chatMembers.member.status,
              rank : chatMembers.rank,
              endOfBan : chatMembers.endOfBan,
              endOfMute : chatMembers.endOfMute,
              email : chatMembers.member.email,
              avatar : chatMembers.member.avatar,
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

    async updateStatus (updateDto: updateChatMemberStatusDto)  {
      try {
        const response = await this.prisma.updateChatMemberStatus(updateDto);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
}
