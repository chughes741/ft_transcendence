
/**
 * 
 */
export class MatchHistoryItem {
  match_type: string;
  players: string;
  results: string;
  date: string;
  winner: boolean;
}

/**
 * 
 */
export class MatchHistoryEntity {
  matches: MatchHistoryItem[];
}

/**
 * 
 */
export class Profile {}
