import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UserlistService } from './userlist.service';
import { Injectable } from '@nestjs/common';
import { ChatMemberRank, ChatMemberStatus } from '@prisma/client';

export interface ChatMemberEntity{
  username: string;
  //avatar: string;
  id : number;
  status : ChatMemberStatus;
  rank : ChatMemberRank;
  endOfBan : any;
  endOfMute : any;
}

@WebSocketGateway()
export class UserlistGateway {
  constructor(private userlistService: UserlistService) {}

  @SubscribeMessage('listUsers')  
  async handleMessage(client: any, payload: any): Promise<any> {      
    console.log("Inside Handle message " + payload.chatRoomName);
    const list : ChatMemberEntity[] = await this.userlistService.getUserList(payload.chatRoomName);
    return {event: 'userList' , data: list}
  }
}
