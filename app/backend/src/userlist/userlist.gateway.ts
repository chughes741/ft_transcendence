import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UserlistService } from './userlist.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway()
export class UserlistGateway {
  constructor(private readonly userlistService: UserlistService) {}

  @SubscribeMessage('listUsers')  
  async handleMessage(client: any, payload: any): Promise<any> {      
    console.log("Inside Handle message " + payload.chatRoomName);
    const list = await this.userlistService.getUserList(payload.chatRoomName);
    return {event: 'userList', data: list };
  }
}
