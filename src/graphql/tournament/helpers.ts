import mongoose from 'mongoose';
import { Round } from './TournamentTypes';
import { Match, MatchResult } from '../match/MatchTypes';
import { User } from '../user/UserTypes';

interface PlayerStat {
  win: number;
  loss: number;
  draw: number;
  bye: number;
  score: number;
  rating: number;
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

      if (match.black !== 'white' && match.black !== 'bye') {
        playerStats[match.white].rating = match.whiteRating;
        playerStats[match.black].rating = match.blackRating;

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
      player.win + player.draw - player.loss + player.bye;
  }

  return playerStats;
};

const createCandidate = (player: PlayerStat, opponent: PlayerStat, opponentId: string) => {
  const played = player.opponents[opponentId];
  const scoreDiff = Math.abs(player.score - opponent.score);
  const ratingDiff = Math.abs(player.rating - opponent.rating);

  return { played, scoreDiff, ratingDiff, id: opponentId };
};

const matchPlayer = (playerId: string, stats: PlayerStats): Match => {
  const player = stats[playerId];

  const candidates: Candidate[] = Object.keys(stats).map(opponentId => {
    const opponent = stats[opponentId];

    if (playerId !== opponentId) {
      return createCandidate(player, opponent, opponentId);
    }
  }).filter(v => v) as Candidate[];

  candidates.sort(
    sortCandidates
  );

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
    white,
    black: white === playerId ? opponentId : playerId,
    whiteRating: player.rating,
    blackRating: opponent.rating,
    result: MatchResult.didNotStart,
    completed: false
  };
};

export const createNewRound = (stats: PlayerStats): Round => {
  const matches = [];

  while (Object.keys(stats).length) {
    const sortedPlayers = Object.entries(stats)
      .map(([id, value]) => ({ id, score: value.score, rating: value.rating, bye: value.bye }))
      .sort((a, b) =>
        a.bye - b.bye || a.score - b.score || a.rating - b.rating);

    // the empty string is just to make typescript happy. It should never be possible for sortedPlayers to be empty
    const playerId = sortedPlayers.pop()?.id || '';

    if (sortedPlayers.length) {
      const match = matchPlayer(playerId, stats);

      delete stats[match.white];
      delete stats[match.black];

      matches.push(match);
    } else {
      matches.push({
        _id: new mongoose.Types.ObjectId().toString(),
        white: playerId,
        black: 'bye',
        whiteRating: stats[playerId].rating,
        blackRating: 0,
        result: MatchResult.didNotStart,
        completed: false
      });

      delete stats[playerId];
    }
  }

  return {
    _id: new mongoose.Types.ObjectId().toString(),
    completed: false,
    matches
  };
};
