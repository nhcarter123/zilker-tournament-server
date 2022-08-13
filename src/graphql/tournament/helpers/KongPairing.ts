import { Match } from '../../match/MatchTypes';
import { createMatch, IOpponentsMap, PlayerStats } from './pairingHelper';

interface PlayerStub {
  id: string;
  rating: number;
  opponents: IOpponentsMap;
}

// export const getRatingMatches = (
//   tournamentId: string,
//   stats: PlayerStats,
//   boardTiebreakSeed: number,
//   byePlayer: Maybe<string>,
//   performanceWeight: number
// ): Match[] => {
//   const neighbors = [];
//   const needsPairings: PlayerStub[] = Object.entries(stats)
//     .map(([id, value]) => ({
//       id,
//       rating: value.rating + value.pairingScore * 40 * performanceWeight,
//       opponents: value.opponents
//     }))
//     .sort((a, b) => a.rating - b.rating)
//     .filter(player => player.id !== byePlayer); // Exclude bye player
//
//   const highestPlayer = needsPairings.pop();
//   if (highestPlayer) {
//     for (const player of needsPairings) {
//       // todo handle case where everyone has played once
//       if (highestPlayer.opponents[player.id]) {
//         continue;
//       }
//
//       const tempNode = node;
//     }
//   }
//
//   // let boardNumber = 0;
//   // const matches: Match[] = [];
//   // const startingLength = players.length;
//   //
//   // while (players.length > 0) {
//   //   const player = players.shift();
//   //
//   //   if (player) {
//   //     const ratingBuffer =
//   //       ((player.rating / 6) * players.length) / startingLength;
//   //
//   //     const opponent = [...players].sort((a, b) => {
//   //       const statsA = stats[a.id];
//   //       const statsB = stats[b.id];
//   //
//   //       return (
//   //         (statsA?.opponents[player.id] || 0) -
//   //           (statsB?.opponents[player.id] || 0) ||
//   //         Math.abs(a.rating - player.rating + ratingBuffer) -
//   //           Math.abs(b.rating - player.rating + ratingBuffer)
//   //       );
//   //     })[0];
//   //
//   //     if (opponent) {
//   //       players = players.filter(player => player.id !== opponent.id);
//   //
//   //       boardNumber += 1;
//   //
//   //       matches.push(
//   //         createMatch(
//   //           player.id,
//   //           opponent.id,
//   //           stats,
//   //           boardNumber,
//   //           tournamentId,
//   //           boardTiebreakSeed + boardNumber
//   //         )
//   //       );
//   //     }
//   //   }
//   // }
//
//   return matches;
// };
