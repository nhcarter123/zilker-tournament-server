import mongoose from 'mongoose';
import { omit } from 'lodash';
import { Round, Standing } from '../TournamentTypes';
import { Match, MatchResult, WeightedMatch } from '../../match/MatchTypes';
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
  [id: string]: PlayerStat
}

interface Candidate {
  id: string;
  played: number;
  scoreDiff: number;
  ratingDiff: number;
}

const sortCandidates = (a: Candidate, b: Candidate) =>
  a.played - b.played || a.scoreDiff - b.scoreDiff || a.ratingDiff - b.ratingDiff;

export const getPlayerStats = (rounds: Round[], players: User[]): PlayerStats => {
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
        playerStats[match.white].rating = match.newWhiteRating || match.whiteRating
        playerStats[match.black].rating = match.newBlackRating || match.blackRating
        playerStats[match.white].matchesPlayed = match.whiteMatchesPlayed
        playerStats[match.black].matchesPlayed = match.blackMatchesPlayed

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
      player.win + (player.draw * 0.5) + (player.bye * 0.75);
  }

  return playerStats;
};

const createCandidate = (player: PlayerStat, opponent: PlayerStat, opponentId: string) => {
  const played = player.opponents[opponentId] || 0;
  const scoreDiff = Math.abs(player.score - opponent.score);
  const ratingDiff = Math.abs(player.rating - opponent.rating);

  return { played, scoreDiff, ratingDiff, id: opponentId };
};

const matchPlayer = (tournamentId: string, playerId: string, stats: PlayerStats): WeightedMatch => {
  const player = stats[playerId];

  const candidates: Candidate[] = Object.keys(stats).map(opponentId => {
    const opponent = stats[opponentId];

    if (playerId !== opponentId) {
      return createCandidate(player, opponent, opponentId);
    }
  }).flatMap(v => v ? [v] : []).sort(sortCandidates);

  const opponentId = candidates[0].id;
  const opponent = stats[opponentId];

  const whitePlayed = player.whitePlayed;
  const opponentWhitePlayed = opponent.whitePlayed;

  const white =
    whitePlayed === opponentWhitePlayed
      ? player.rating > opponent.rating
      ? playerId
      : opponentId
      : whitePlayed > opponentWhitePlayed
      ? opponentId
      : playerId;

  return {
    _id: new mongoose.Types.ObjectId().toString(),
    tournamentId,
    white,
    boardNumber: 0,
    black: white === playerId ? opponentId : playerId,
    whiteRating: player.rating,
    blackRating: opponent.rating,
    whiteMatchesPlayed: player.matchesPlayed + 1,
    blackMatchesPlayed: opponent.matchesPlayed + 1,
    result: MatchResult.didNotStart,
    completed: false,
    weight: opponent.score + player.score
  };
};

export const createNewRound = (tournamentId: string, stats: PlayerStats, currentPlayers: string[]): Round => {
  let weightedMatches: WeightedMatch[] = [];

  for (const id of Object.keys(stats)) {
    if (!currentPlayers.includes(id)) {
      delete stats[id];
    }
  }

  while (Object.keys(stats).length) {
    const sortedPlayers = Object.entries(stats)
      .map(([id, value]) => ({ id, score: value.score, rating: value.rating, bye: value.bye }))
      .sort((a, b) =>
        a.bye - b.bye || a.score - b.score || a.rating - b.rating);

    // the empty string is just to make typescript happy. It should never be possible for sortedPlayers to be empty
    const playerId = sortedPlayers.pop()?.id || '';

    if (sortedPlayers.length) {
      const match = matchPlayer(tournamentId, playerId, stats);

      delete stats[match.white];
      delete stats[match.black];

      weightedMatches.push(match);
    } else {
      weightedMatches.push({
        _id: new mongoose.Types.ObjectId().toString(),
        tournamentId,
        white: playerId,
        black: 'bye',
        whiteRating: stats[playerId].rating,
        blackRating: 0,
        whiteMatchesPlayed: stats[playerId].matchesPlayed,
        blackMatchesPlayed: 0,
        boardNumber: 0,
        weight: 0,
        result: MatchResult.didNotStart,
        completed: false
      });

      delete stats[playerId];
    }
  }

  const matches: Match[] = weightedMatches.sort((a, b) => b.weight - a.weight).map((match, index) => omit({
    ...match,
    boardNumber: index + 1
  }, 'weight'));

  return {
    _id: new mongoose.Types.ObjectId().toString(),
    completed: false,
    matches
  };
};

export const createStandings = (stats: PlayerStats): Standing[] => {
  return Object.entries(stats).map(([userId, stat]) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    userId,
    position: 0,
    score: stat.score,
    win: stat.win,
    loss: stat.loss,
    draw: stat.draw,
    bye: stat.bye
  })).sort((a, b) => b.score - a.score)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
};