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
 *
 */
export class JoinGameQueueDto extends GameInviteDto {}

/**
 *
 */
export class PlayerReadyDto {
  lobby_id: string;
}
