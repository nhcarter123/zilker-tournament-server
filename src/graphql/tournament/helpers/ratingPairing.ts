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
  byePlayer: Maybe<string>,
  performanceWeight: number,
  roundNumber: number
): Match[] => {
  let players: PlayerStub[] = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.score,
      rating: value.rating + value.pairingScore * 25 * performanceWeight
    }))
    .sort((a, b) => b.rating - a.rating)
    .filter(player => player.id !== byePlayer); // Exclude bye player

  let boardNumber = 0;
  const matches: Match[] = [];
  const startingLength = players.length;

  while (players.length > 0) {
    const player = players.shift();

    if (player) {
      const ratingBuffer =
        ((player.rating / 8) * (players.length / startingLength)) /
        (roundNumber + 1);

      const opponent = [...players].sort((a, b) => {
        const statsA = stats[a.id];
        const statsB = stats[b.id];

        return (
          (statsA?.opponents[player.id] || 0) -
            (statsB?.opponents[player.id] || 0) ||
          Math.abs(a.rating - player.rating + ratingBuffer) -
            Math.abs(b.rating - player.rating + ratingBuffer)
        );
      })[0];

      if (opponent) {
        players = players.filter(player => player.id !== opponent.id);

        boardNumber += 1;

        matches.push(
          createMatch(
            player.id,
            opponent.id,
            stats,
            tournamentId,
            null,
            boardTiebreakSeed + boardNumber,
            boardNumber
          )
        );
      }
    }
  }

  return matches;
};
