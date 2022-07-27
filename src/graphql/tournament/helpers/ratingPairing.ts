import { Match } from '../../match/MatchTypes';
import { createMatch, PlayerStats } from './pairingHelper';

interface PlayerStub {
  id: string;
  score: number;
  rating: number;
}

export const getRatingMatches = (
  tournamentId: string,
  stats: PlayerStats,
  boardTiebreakSeed: number,
  byePlayer: Maybe<string>
): Match[] => {
  const candidates: PlayerStub[] = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.score,
      rating: value.rating
    }))
    .sort((a, b) => b.rating - a.rating)
    .filter(player => player.id !== byePlayer); // Exclude bye player

  let boardNumber = 0;
  const matches: Match[] = [];

  while (candidates.length > 0) {
    const player = candidates.shift();

    if (player) {
      const opponent = [...candidates]
        .sort((a, b) => {
          const statsA = stats[a.id];
          const statsB = stats[b.id];

          return (
            (statsA?.opponents[player.id] || 0) -
            (statsB?.opponents[player.id] || 0) -
            b.rating -
            a.rating
          );
        })
        .shift();

      if (opponent) {
        boardNumber += 1;

        matches.push(
          createMatch(
            player.id,
            opponent.id,
            stats,
            boardNumber,
            tournamentId,
            boardTiebreakSeed + boardNumber
          )
        );
      }
    }
  }

  return matches;
};
