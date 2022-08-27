import { compact } from 'lodash';
import { Match } from '../../match/MatchTypes';
import { createMatch, IOpponentsMap, PlayerStats } from './pairingHelper';

interface IPlayerStub {
  id: string;
  rating: number;
  pairingScore: number;
  opponents: IOpponentsMap;
}

export interface IPlayerStatsStub {
  [id: string]: IPlayerStub;
}

const MAX_EXPLORE_NODES = 5;

const canMatchWithPlayer = (
  highestPlayer: IPlayerStub,
  id: string,
  sortedPlayerIds: string[]
): boolean => {
  const timesPlayedHighestPlayer = highestPlayer.opponents[id] || 0;

  if (timesPlayedHighestPlayer === 0) {
    return true;
  } else {
    // The rare case that they have played every player at least once
    const minimumPlayedEachOpponent = sortedPlayerIds.reduce(
      (previousValue, opponent) => {
        const timesPlayedOpponent = highestPlayer.opponents[opponent] || 0;
        if (
          timesPlayedOpponent < previousValue &&
          // Do not check that they have played themselves
          opponent !== highestPlayer.id
        ) {
          return timesPlayedOpponent;
        }

        return previousValue;
      },
      Infinity
    );

    if (timesPlayedHighestPlayer <= minimumPlayedEachOpponent) {
      return true;
    }
  }

  return false;
};

const getOptimizedNeighbors = (
  node: INode,
  sortedPlayerIds: string[],
  players: IPlayerStatsStub
): INode[] => {
  const neighbors = [];
  const idsWithoutPairings = sortedPlayerIds.filter(
    id => !node.pairingIdSet.has(id)
  );

  const highestUnPairedPlayerId = idsWithoutPairings.pop();

  if (highestUnPairedPlayerId) {
    const highestPlayer = players[highestUnPairedPlayerId];
    if (highestPlayer) {
      // create all valid pairs with highest rated player
      for (let i = idsWithoutPairings.length - 1; i >= 0; i--) {
        const id = idsWithoutPairings[i];
        if (id && canMatchWithPlayer(highestPlayer, id, sortedPlayerIds)) {
          const pairings = [...node.pairings, [highestPlayer.id, id]];

          const tempNode: INode = {
            pairings,
            pairingIdSet: new Set<string>(pairings.flat())
          };

          neighbors.push(tempNode);

          if (neighbors.length >= MAX_EXPLORE_NODES) {
            break;
          }
        }
      }
    }
  }

  return neighbors.reverse();
};

interface INode {
  pairings: string[][];
  pairingIdSet: Set<string>;
}

interface ICache {
  [key: string]: number;
}

const getPairingKey = (
  pairingIdSet: Set<string>,
  sortedPlayerIds: string[]
): string => {
  return sortedPlayerIds.map(id => (pairingIdSet.has(id) ? 1 : 0)).join('');
};

const getNodeScore = (node: INode, players: IPlayerStatsStub) => {
  return node.pairings.reduce((previous, [a, b]) => {
    if (a && b) {
      const playerA = players[a];
      const playerB = players[b];
      if (playerA && playerB) {
        const timesBPlayedA = playerB.opponents[a] || 0;

        return (
          previous +
          Math.pow(playerA.rating - playerB.rating, 2) +
          100000 * timesBPlayedA
        );
      }
    }

    return previous;
  }, 0);
};

export const getKongRatingMatches = (
  tournamentId: string,
  stats: PlayerStats,
  boardTiebreakSeed: number,
  byePlayer: Maybe<string>,
  performanceWeight: number
): Match[] => {
  const players: IPlayerStatsStub = Object.entries(stats).reduce(
    (previous, [id, value]) => {
      previous[id] = {
        id,
        pairingScore: value.pairingScore,
        rating: value.rating + value.pairingScore * 40 * performanceWeight,
        opponents: value.opponents
      };

      return previous;
    },
    {} as IPlayerStatsStub
  );

  const sortedPlayerIds: string[] = Object.entries(players)
    .map(([id, value]) => ({ id, rating: value.rating }))
    .sort((a, b) => a.rating - b.rating)
    .map(stat => stat.id)
    .filter(player => player !== byePlayer); // Exclude bye player

  const stack: INode[] = [{ pairingIdSet: new Set<string>(), pairings: [] }];
  let bestPairings: string[][] = [];
  let bestScore = Infinity;
  const cache: ICache = {};

  while (stack.length) {
    const currentNode = stack.pop();

    if (currentNode) {
      const score = getNodeScore(currentNode, players);

      if (currentNode.pairingIdSet.size === sortedPlayerIds.length) {
        // Successfully paired everyone

        if (score < bestScore) {
          bestScore = score;
          bestPairings = currentNode.pairings;
        }

        continue;
      }

      // Only get neighbors if current pairings are better than previous
      const pairingKey = getPairingKey(
        currentNode.pairingIdSet,
        sortedPlayerIds
      );

      const savedScore = cache[pairingKey] || Infinity;
      if (score < savedScore) {
        cache[pairingKey] = score;
      } else {
        continue;
      }

      const neighbors = getOptimizedNeighbors(
        currentNode,
        sortedPlayerIds,
        players
      );
      // Since the end of the list is the top of the stack
      // we directly attach the neighbors list onto the stack
      // so the top of the stack has the closest matchup
      stack.push(...neighbors);
    }
  }

  console.log(bestPairings);
  console.log(bestScore);

  return compact(
    bestPairings.map(([a, b], index) => {
      if (a && b) {
        return createMatch(
          a,
          b,
          stats,
          index + 1,
          tournamentId,
          boardTiebreakSeed + index + 1
        );
      }
    })
  );

  // const highestPlayer = needsPairings.pop();
  // if (highestPlayer) {
  //   for (const player of needsPairings) {
  //     // todo handle case where everyone has played once
  //     if (highestPlayer.opponents[player.id]) {
  //       continue;
  //     }
  //
  //     const tempNode = node;
  //   }
  // }

  // let boardNumber = 0;
  // const matches: Match[] = [];
  // const startingLength = players.length;
  //
  // while (players.length > 0) {
  //   const player = players.shift();
  //
  //   if (player) {
  //     const ratingBuffer =
  //       ((player.rating / 6) * players.length) / startingLength;
  //
  //     const opponent = [...players].sort((a, b) => {
  //       const statsA = stats[a.id];
  //       const statsB = stats[b.id];
  //
  //       return (
  //         (statsA?.opponents[player.id] || 0) -
  //           (statsB?.opponents[player.id] || 0) ||
  //         Math.abs(a.rating - player.rating + ratingBuffer) -
  //           Math.abs(b.rating - player.rating + ratingBuffer)
  //       );
  //     })[0];
  //
  //     if (opponent) {
  //       players = players.filter(player => player.id !== opponent.id);
  //
  //       boardNumber += 1;
  //
  //       matches.push(
  //         createMatch(
  //           player.id,
  //           opponent.id,
  //           stats,
  //           boardNumber,
  //           tournamentId,
  //           boardTiebreakSeed + boardNumber
  //         )
  //       );
  //     }
  //   }
  // }
};
