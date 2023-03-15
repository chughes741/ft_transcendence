import { Injectable } from "@nestjs/common";
import { Interval } from '@nestjs/schedule';
import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { Server } from 'socket.io';

// import {
  // ClientReadyEvent,
  // ClientUpdateEvent,
  // CreateLobbyEvent,
  // InvitePlayerEvent,
  // JoinLobbyEvent
// } from "../../../shared/events/game.events";



@Injectable()
export class GameService {

  static rot: number = 0;

  @WebSocketServer()
  public server: Server;


  sendServerUpdate(): number {
      //Set initial vector for ball direction

      //Calculate collision and new direction



      GameService.rot++;
      if (GameService.rot === 360)
        GameService.rot = 0;
      return GameService.rot;
  }




  /**
   *
   * @param createLobbyEvent
   * @emits JoinLobbyReply
   */
  // async createLobby(createLobbyEvent: CreateLobbyEvent): Promise<string> {
    // /** @todo implementation */
    // return "Created a new lobby";
  // }

  /**
   *
   * @param joinLobbyEvent
   * @emits JoinLobbyReply
   */
  // async joinLobby(joinLobbyEvent: JoinLobbyEvent): Promise<string> {
    // /** @todo implementation */
    // return "Joined a lobby";
  // }

  /**
   *
   * @param invitePlayerEvent
   */
  // async invitePlayer(invitePlayerEvent: InvitePlayerEvent): Promise<string> {
    // /** @todo implementation */
    // return "Invited a player";
  // }

  /**
   *
   * @param clientReadyEvent
   */
  // async clientReady(clientReadyEvent: ClientReadyEvent): Promise<string> {
    /** @todo implementation */
    // return "Client is ready";
  // }

  /**
   *
   * @param clientUpdateEvent
   */
  // async clientUpdate(clientUpdateEvent: ClientUpdateEvent): Promise<string> {
    /** @todo implementation */
    // return "Client is updated";
  // }

  /**
   * 
   * @returns 
   * @emits GameStartEvent
   */
  // async gameStart() {
    /** @todo implementation */
    // return "Game has started"
  // }
}
