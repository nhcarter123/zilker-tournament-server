import mongoose from 'mongoose';
import { groupBy } from 'lodash';
import { Round, Standing } from '../TournamentTypes';
import { Match, MatchResult } from '../../match/MatchTypes';
import { User } from '../../user/UserTypes';
import { batchGroups, fillGaps, swissSplit } from './swissJank';

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

  // look through all the previous rounds and sum the player's stats
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

      if (match.white !== 'bye' && match.black !== 'bye') {
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
  tournamentId: string,
  boardTiebreakSeed: number
): Match => {
  const player = stats[playerId];
  const opponent = stats[opponentId];

  const whitePlayed = player.whitePlayed;
  const opponentWhitePlayed = opponent.whitePlayed;

  const white =
    whitePlayed === opponent.whitePlayed
      ? boardTiebreakSeed % 2 === 1
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
    whiteScore: 0,
    blackScore: 0,
    whiteRating: stats[white].rating,
    blackRating: stats[black].rating,
    whiteMatchesPlayed: stats[white].matchesPlayed + 1,
    blackMatchesPlayed: stats[black].matchesPlayed + 1,
    boardNumber,
    result: MatchResult.didNotStart,
    completed: false
  };
};

export const createNewRound = (
  tournamentId: string,
  stats: PlayerStats, // A bunch of useful info about the players and their performance
  currentPlayers: string[], // Current players in the tournament
  maxPunchDown: number, // Variable used for pairing
  boardTiebreakSeed: number // Seed number used for tie breaking starting color
): Round => {
  // Filter out players that are no longer in the tournament
  for (const id of Object.keys(stats)) {
    if (!currentPlayers.includes(id)) {
      delete stats[id];
    }
  }

  // Get the bye player - It's easier to do this first so we can exclude them from pairing logic
  const byePlayer = findByePlayer(stats);

  // A bunch of janky accelerated swiss code... **************************** START
  const sortedPlayers: PlayerStub[] = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.score,
      rating: value.rating
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .filter(player => player.id !== byePlayer); // Exclude bye player

  const groups: string[][] = Object.values(
    groupBy(sortedPlayers, player => player.score)
  )
    .sort((a, b) => b[0].score - a[0].score)
    .map(group => group.map(player => player.id));

  const batchedGroups = batchGroups(groups, 2 * maxPunchDown);

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
  // A bunch of janky accelerated swiss code... **************************** END

  if (byePlayer) {
    matches.push({
      _id: new mongoose.Types.ObjectId().toString(),
      tournamentId,
      white: byePlayer,
      black: 'bye',
      whiteScore: 0,
      blackScore: 0,
      whiteRating: stats[byePlayer].rating,
      blackRating: 0,
      whiteMatchesPlayed: stats[byePlayer].matchesPlayed,
      blackMatchesPlayed: 0,
      boardNumber: boardNumber + 1,
      result: MatchResult.didNotStart,
      completed: false
    });
  }

  // Need to return a Round which is basically na array of matches

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
