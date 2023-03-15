
//Websockets imports
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';

import { Server } from 'socket.io';

import { LoginEventSchema } from './router.schema';
  

//@WebSocketGateway(port, {arguments})
//Set config for websocket
@WebSocketGateway({
  cors: {
    origin: '*', //Change later to specific URL:port
  },
})


export class RouterGateway {
  //Create websocket server object
  @WebSocketServer() server: Server = new Server();
  

  //Subscribe to 'test' events and create function to handle
  @SubscribeMessage('test')
  async handleEvent(
    @MessageBody()
    payload: LoginEventSchema) 
  {
    this.server.emit('test', payload);
    return payload;
  }

}
