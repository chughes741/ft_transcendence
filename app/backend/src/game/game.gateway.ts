import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody
} from "@nestjs/websockets";
import { GameService } from "./game.service";
// import {
  // ClientReadyEvent,
  // ClientUpdateEvent,
  // CreateLobbyEvent,
  // GameEvents,
  // InvitePlayerEvent,
  // JoinLobbyEvent,
// } from "../../../shared/events/game.events";

@WebSocketGateway()
export class GameGateway {
  constructor(private readonly gameService: GameService) {}

  /**
   *
   * @param CreateLobbyEvent
   */
  // @SubscribeMessage(GameEvents.createLobby)
  // async createLobby(@MessageBody() createLobbyEvent: CreateLobbyEvent) {
    // return this.gameService.createLobby(createLobbyEvent);
  // }

  /**
   *
   * @param JoinLobbyEvent
   */
  // @SubscribeMessage(GameEvents.joinLobby)
  // async joinLobby(@MessageBody() joinLobbyEvent: JoinLobbyEvent) {
    // return this.gameService.joinLobby(joinLobbyEvent);
  // }

  /**
   *
   * @param InvitePlayerEvent
   */
  // @SubscribeMessage(GameEvents.invitePlayer)
  // async invitePlayer(@MessageBody() invitePlayerEvent: InvitePlayerEvent) {
    // return this.gameService.invitePlayer(invitePlayerEvent);
  // }

  /**
   *
   * @param ClientReadyEvent
   */
  // @SubscribeMessage(GameEvents.clientReady)
  // async clientReady(@MessageBody() clientReadyEvent: ClientReadyEvent) {
    // return this.gameService.clientReady(clientReadyEvent);
  // }

  /**
   * 
   * @param ClientUpdateEvent 
   */
  // @SubscribeMessage(GameEvents.clientUpdate)
  // async clientUpdate(@MessageBody() clientUpdateEvent: ClientUpdateEvent) {
    // return this.gameService.clientUpdate(clientUpdateEvent);
  // }
}
 