import { chunk, groupBy } from 'lodash';
import { Match } from '../../match/MatchTypes';
import { createMatch, PlayerStats } from './pairingHelper';

interface PlayerStub {
  id: string;
  score: number;
  rating: number;
}

interface Candidate {
  id: string;
  index: number;
  targetIndex: number;
}

export const batchGroups = (groups: string[][], maxPunchDown: number) =>
  groups.flatMap(group => chunk(group, maxPunchDown));

export const swissSplit = (group: string[]) => {
  const halfLength = Math.ceil(group.length / 2);
  const topPlayers = group.splice(0, halfLength);

  return [topPlayers, group];
};

export const fillGaps = (parallelGroups: string[][][]) => {
  const filledGroups = [];

  for (let i = 0; i < parallelGroups.length; i++) {
    const column = parallelGroups[i];

    const groupA = column && column[0] ? column[0] : [];
    const groupB = column && column[1] ? column[1] : [];

    if (i < parallelGroups.length - 1) {
      const nextColumn = parallelGroups[i + 1];

      while (groupA.length !== groupB.length) {
        while (groupB.length < groupA.length) {
          const nextGroupA = nextColumn && nextColumn[0] ? nextColumn[0] : [];

          groupB.push(nextGroupA.shift() || '');
        }

        while (groupA.length < groupB.length) {
          groupA.push(groupB.shift() || '');
        }
      }
    }

    filledGroups.push([groupA, groupB]);
  }

  return filledGroups;
};

interface IPair {
  id: string;
  opponentId: string;
}

export const getSwissMatches = (
  tournamentId: string,
  stats: PlayerStats,
  maxPunchDown: number,
  boardTiebreakSeed: number,
  byePlayer: Maybe<string>
): Match[] => {
  // A bunch of janky accelerated swiss code... **************************** START
  const sortedPlayers: PlayerStub[] = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.pairingScore,
      rating: value.rating
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .filter(player => player.id !== byePlayer); // Exclude bye player

  const groups: string[][] = Object.values(
    groupBy(sortedPlayers, player => player.score)
  )
    .sort((a, b) => (b[0] ? b[0].score : 0) - (a[0] ? a[0].score : 0))
    .map(group => group.map(player => player.id));

  const batchedGroups = batchGroups(groups, 2 * maxPunchDown);

  const parallelGroups = batchedGroups.map(group => swissSplit(group));

  const adjustedParallelGroups = fillGaps(parallelGroups).filter(
    group => group[0] && group[0].length !== 0
  );

  let properOrder: IPair[] = [];

  adjustedParallelGroups.forEach(parallelGroup => {
    if (parallelGroup[0]) {
      parallelGroup[0].forEach((id, index) =>
        properOrder.push({
          id,
          opponentId: parallelGroup[1] ? parallelGroup[1][index] || '' : ''
        })
      );
    }
    if (parallelGroup[1]) {
      parallelGroup[1].forEach((id, index) =>
        properOrder.push({
          id,
          opponentId: parallelGroup[0] ? parallelGroup[0][index] || '' : ''
        })
      );
    }
  });

  const candidates: Candidate[] = properOrder.map((pair, index) => ({
    id: pair.id,
    index,
    targetIndex: properOrder.findIndex(p => p.id === pair.opponentId)
  }));

  let boardNumber = 0;
  const matches: Match[] = [];

  while (candidates.length > 0) {
    const player = candidates.sort((a, b) => a.index - b.index).shift();

    if (player) {
      const opponent = candidates
        .sort((a, b) => {
          const statsA = stats[a.id];
          const statsB = stats[b.id];

          return (
            (statsA?.opponents[player.id] || 0) -
              (statsB?.opponents[player.id] || 0) ||
            Math.abs(a.index - player.targetIndex) -
              Math.abs(b.index - player.targetIndex) ||
            a.index - b.index
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
