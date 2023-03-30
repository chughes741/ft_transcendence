/**
 *
 */
class GameInviteDto {
  match_type: string;
}

/**
 * Timeout y/n
 * Lobby ID?
 */
export class JoinGameInviteDto extends GameInviteDto {
  opponent_name: string;
}

/**
 *  @var client_id The UUID of the client (unwrapped from JWT in the authguard)
 *  @var join_time Timestamp of when the client joined the queue
 */
export class JoinGameQueueDto {
  client_id: string;
  join_time: number;
}

/**
 *
 */
export class PlayerReadyDto {
  lobby_id: string;
}
