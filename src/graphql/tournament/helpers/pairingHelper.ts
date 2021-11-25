import mongoose from 'mongoose';
import { chunk } from 'lodash';
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
  matchesPlayed: number;
  whitePlayed: number;
  opponents: {
    [id: string]: number;
  };
}

interface PlayerStats {
  [id: string]: PlayerStat;
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

    playerStats[playerId].score = player.win + player.draw * 0.5 + player.bye;
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
    blackRating: stats[white].rating,
    whiteMatchesPlayed: stats[white].matchesPlayed + 1,
    blackMatchesPlayed: stats[black].matchesPlayed + 1,
    boardNumber,
    result: MatchResult.didNotStart,
    completed: false
  };
};

export const createNewRound = (
  tournamentId: string,
  stats: PlayerStats,
  currentPlayers: string[],
  splitCount: number
): Round => {
  for (const id of Object.keys(stats)) {
    if (!currentPlayers.includes(id)) {
      delete stats[id];
    }
  }

  const byePlayer = findByePlayer(stats);

  const sortedPlayers = Object.entries(stats)
    .map(([id, value]) => ({
      id,
      score: value.score,
      rating: value.rating,
      bye: value.bye
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .filter(player => player.id !== byePlayer);

  const totalGroups = 2 * splitCount;
  const playerCount = sortedPlayers.length;
  const groupSize = Math.floor(playerCount / totalGroups);
  const remainder = playerCount % totalGroups;

  const groups = chunk(sortedPlayers.map(player => player.id), groupSize);

  let groupA: string[][] = [];
  let groupB: string[][] = [];

  groups.forEach(
    (group, index) =>
      index % 2 === 0 ? groupA.push(group) : groupB.push(group)
  );

  if (remainder > 0) {
    if (groupA.length > groupB.length) {
      groupB.push([]);
    }

    const lastA = groupA.pop() || [];
    const lastB = groupB.pop() || [];

    while (lastA.length > lastB.length) {
      const worstPlayerInA = lastA.pop();

      if (worstPlayerInA) {
        lastB.splice(0, 0, worstPlayerInA);
      }
    }

    groupA = [...groupA, lastA];
    groupB = [...groupB, lastB];
  }

  const combinedA = groupA.flat();
  const combinedB = groupB.flat();

  const matches = combinedA
    .map((playerId, index) => {
      const player = stats[playerId];

      for (let i = 0; i < combinedB.length; i++) {
        const opponentId = combinedB[i];

        // this only works correctly if rounds < total players which is a safe enough assumption for now
        if (!player.opponents[opponentId]) {
          combinedB.splice(i, 1);
          return createMatch(playerId, opponentId, stats, index, tournamentId);
        }
      }
    })
    .flatMap(v => (v ? [v] : []));

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
      boardNumber: combinedA.length + 1,
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
      win: stat.win,
      loss: stat.loss,
      draw: stat.draw,
      bye: stat.bye
    }))
    .sort((a, b) => b.score - a.score)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
};
