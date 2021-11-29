import mongoose from 'mongoose';
import { chunk, groupBy } from 'lodash';
import { Round, Standing } from '../TournamentTypes';
import { Match, MatchResult } from '../../match/MatchTypes';
import { User } from '../../user/UserModel';

interface PlayerStat {
  win: number;
  loss: number;
  draw: number;
  bye: number;
  score: number;
  rating: number;
  previousRating: number;
  matchesPlayed: number;
  whitePlayed: number;
  opponents: {
    [id: string]: number;
  };
}

interface PlayerStats {
  [id: string]: PlayerStat;
}

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

export const getPlayerStats = (
  rounds: Round[],
  players: User[]
): PlayerStats => {
  const playerStats: PlayerStats = {};

  players.forEach(player => {
    playerStats[player._id] = {
      win: 0,
      loss: 0,
      draw: 0,
      bye: 0,
      score: 0,
      previousRating: player.rating,
      rating: player.rating,
      matchesPlayed: player.matchesPlayed,
      whitePlayed: 0,
      opponents: {}
    };
  });

  //calculate new round
  for (const round of rounds) {
    for (const match of round.matches) {
      switch (match.result) {
        case MatchResult.whiteWon:
          playerStats[match.white].win += 1;
          playerStats[match.black].loss += 1;
          break;
        case MatchResult.blackWon:
          playerStats[match.white].loss += 1;
          playerStats[match.black].win += 1;
          break;
        case MatchResult.draw:
          playerStats[match.white].draw += 1;
          playerStats[match.black].draw += 1;
          break;
        case MatchResult.didNotStart:
          if (match.white !== 'bye') {
            playerStats[match.white].bye += 1;
          }
          if (match.black !== 'bye') {
            playerStats[match.black].bye += 1;
          }
          break;
      }

      if (match.black !== 'bye' && match.black !== 'bye') {
        playerStats[match.white].previousRating = match.whiteRating;
        playerStats[match.black].previousRating = match.blackRating;

        playerStats[match.white].rating =
          match.newWhiteRating || match.whiteRating;
        playerStats[match.black].rating =
          match.newBlackRating || match.blackRating;

        playerStats[match.white].matchesPlayed = match.whiteMatchesPlayed;
        playerStats[match.black].matchesPlayed = match.blackMatchesPlayed;

        playerStats[match.white].whitePlayed += 1;

        if (playerStats[match.white].opponents[match.black]) {
          playerStats[match.white].opponents[match.black] += 1;
        } else {
          playerStats[match.white].opponents[match.black] = 1;
        }

        if (playerStats[match.black].opponents[match.white]) {
          playerStats[match.black].opponents[match.white] += 1;
        } else {
          playerStats[match.black].opponents[match.white] = 1;
        }
      }
    }
  }

  for (const playerId of Object.keys(playerStats)) {
    const player = playerStats[playerId];

    playerStats[playerId].score =
      player.win + player.draw * 0.5 + player.bye * 0.5;
  }

  return playerStats;
};

const findByePlayer = (stats: PlayerStats): string | undefined => {
  const entries = Object.entries(stats);

  if (entries.length % 2 === 1) {
    const sortedPlayers = entries
      .map(([id, value]) => ({
        id,
        score: value.score,
        rating: value.rating,
        bye: value.bye
      }))
      .sort(
        (a, b) => b.bye - a.bye || b.score - a.score || b.rating - a.rating
      );

    const player = sortedPlayers.pop();

    if (player) {
      return player.id;
    }
  }
};

const createMatch = (
  playerId: string,
  opponentId: string,
  stats: PlayerStats,
  boardNumber: number,
  tournamentId: string
): Match => {
  const player = stats[playerId];
  const opponent = stats[opponentId];

  const whitePlayed = player.whitePlayed;
  const opponentWhitePlayed = opponent.whitePlayed;

  const white =
    whitePlayed === opponent.whitePlayed
      ? player.rating > opponent.rating
        ? playerId
        : opponentId
      : whitePlayed > opponentWhitePlayed
        ? opponentId
        : playerId;

  const black = white === playerId ? opponentId : playerId;

  return {
    _id: new mongoose.Types.ObjectId().toString(),
    tournamentId,
    white,
    black,
    whiteRating: stats[white].rating,
    blackRating: stats[black].rating,
    whiteMatchesPlayed: stats[white].matchesPlayed + 1,
    blackMatchesPlayed: stats[black].matchesPlayed + 1,
    boardNumber,
    result: MatchResult.didNotStart,
    completed: false
  };
};

const batchGroups = (groups: string[][], maxPunchdown: number) =>
  groups.flatMap(group => chunk(group, maxPunchdown));

const swissSplit = (group: string[]) => {
  const halfLength = Math.ceil(group.length / 2);
  const topPlayers = group.splice(0, halfLength);

  return [topPlayers, group];
};

const fillGaps = (parallelGroups: string[][][]) => {
  const filledGroups = [];

  for (let i = 0; i < parallelGroups.length; i++) {
    const groupA = parallelGroups[i][0] || [];
    const groupB = parallelGroups[i][1] || [];

    if (i < parallelGroups.length - 1) {
      while (groupA.length !== groupB.length) {
        while (groupB.length < groupA.length) {
          const nextGroupA = parallelGroups[i + 1][0] || [];

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

export const createNewRound = (
  tournamentId: string,
  stats: PlayerStats,
  currentPlayers: string[],
  maxPunchdown: number
): Round => {
  for (const id of Object.keys(stats)) {
    if (!currentPlayers.includes(id)) {
      delete stats[id];
    }
  }

  const byePlayer = findByePlayer(stats);

  const sortedPlayers: PlayerStub[] = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.score,
      rating: value.rating
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .filter(player => player.id !== byePlayer);

  const groups: string[][] = Object.values(
    groupBy(sortedPlayers, player => player.score)
  )
    .sort((a, b) => b[0].score - a[0].score)
    .map(group => group.map(player => player.id));

  const batchedGroups = batchGroups(groups, 2 * maxPunchdown);

  const parallelGroups = batchedGroups.map(group => swissSplit(group));

  const adjustedParallelGroups = fillGaps(parallelGroups).filter(
    group => group[0].length !== 0
  );

  let properOrder: string[] = [];

  adjustedParallelGroups.forEach(parallelGroup => {
    properOrder = properOrder.concat(parallelGroup[0]);
  });

  adjustedParallelGroups.forEach(parallelGroup => {
    properOrder = properOrder.concat(parallelGroup[1]);
  });

  const candidates: Candidate[] = properOrder.map((id, index) => ({
    id,
    index,
    targetIndex:
      index -
      ((index >= properOrder.length / 2 ? 1 : -1) * properOrder.length) / 2
  }));

  let boardNumber = 0;
  const matches: Match[] = [];

  while (candidates.length > 0) {
    const player = candidates.sort((a, b) => a.index - b.index).shift();

    if (player) {
      const opponent = candidates
        .sort(
          (a, b) =>
            (stats[a.id].opponents[player.id] || 0) -
              (stats[b.id].opponents[player.id] || 0) ||
            Math.abs(a.index - player.targetIndex) -
              Math.abs(b.index - player.targetIndex) ||
            a.index - b.index
        )
        .shift();

      if (opponent) {
        boardNumber += 1;

        matches.push(
          createMatch(player.id, opponent.id, stats, boardNumber, tournamentId)
        );
      }
    }
  }

  if (byePlayer) {
    matches.push({
      _id: new mongoose.Types.ObjectId().toString(),
      tournamentId,
      white: byePlayer,
      black: 'bye',
      whiteRating: stats[byePlayer].rating,
      blackRating: 0,
      whiteMatchesPlayed: stats[byePlayer].matchesPlayed,
      blackMatchesPlayed: 0,
      boardNumber: boardNumber + 1,
      result: MatchResult.didNotStart,
      completed: false
    });
  }

  return {
    _id: new mongoose.Types.ObjectId().toString(),
    completed: false,
    matches
  };
};

export const createStandings = (stats: PlayerStats): Standing[] => {
  return Object.entries(stats)
    .map(([userId, stat]) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      userId,
      position: 0,
      score: stat.score,
      rating: stat.rating,
      win: stat.win,
      loss: stat.loss,
      draw: stat.draw,
      bye: stat.bye
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
};
