import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UserlistService } from './userlist.service';
import { Injectable } from '@nestjs/common';
import { ChatMemberRank, ChatMemberStatus, UserStatus } from '@prisma/client';
import { Socket, Server } from "socket.io";
import { WebSocketServer } from '@nestjs/websockets';
import { updateChatMemberStatusDto } from './dto/userlist.dto';

export interface ChatMemberEntity{
  username: string;
  avatar: string;
  id : number;
  chatMemberstatus : ChatMemberStatus;
  userStatus : UserStatus;
  email : string,
  rank : ChatMemberRank;
  endOfBan : any;
  endOfMute : any;
}

@WebSocketGateway()
export class UserlistGateway {
  constructor(private userlistService: UserlistService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('listUsers')  
  async handleMessage(client: any, payload: any): Promise<any> {      
    console.log("Inside Handle message " + payload.chatRoomName);
    const list : ChatMemberEntity[] = await this.userlistService.getUserList(payload.chatRoomName);
    return {event: 'userList' , data: list}
  }

  @SubscribeMessage('muteChatMember')
  async muteChatMember(client: Socket, data: updateChatMemberStatusDto): Promise<void> {
    const chatMember = await this.userlistService.updateStatus(data);

    // Broadcast the updated chat member information to all clients connected to the chat
    this.server.to(data.roomName).emit('chatMemberUpdated', chatMember);
  }
}
