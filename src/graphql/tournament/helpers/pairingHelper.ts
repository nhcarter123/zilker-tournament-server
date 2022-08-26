import mongoose from 'mongoose';
import {
  EPairingAlgorithm,
  Round,
  Standing,
  Tournament
} from '../TournamentTypes';
import { Match, MatchResult } from '../../match/MatchTypes';
import { User } from '../../user/UserTypes';
import { getSwissMatches } from './swissPairing';
import { getKongRatingMatches } from './KongPairing';

export interface IOpponentsMap {
  [id: string]: number;
}

interface PlayerStat {
  win: number;
  loss: number;
  draw: number;
  bye: number;
  score: number;
  pairingScore: number;
  rating: number;
  initialRating: number;
  previousRating: number;
  matchesPlayed: number;
  whitePlayed: number;
  opponents: IOpponentsMap;
}

export interface PlayerStats {
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
      pairingScore: 0,
      previousRating: player.rating,
      rating: player.rating,
      initialRating: player.rating,
      matchesPlayed: player.matchesPlayed,
      whitePlayed: 0,
      opponents: {}
    };
  });

  // look through all the previous rounds and sum the player's stats
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    if (round) {
      for (const match of round.matches) {
        switch (match.result) {
          case MatchResult.whiteWon: {
            const white = playerStats[match.white];
            if (white) {
              white.win += 1;
            }

            const black = playerStats[match.black];
            if (black) {
              black.loss += 1;
            }
            break;
          }
          case MatchResult.blackWon: {
            const white = playerStats[match.white];
            if (white) {
              white.loss += 1;
            }

            const black = playerStats[match.black];
            if (black) {
              black.win += 1;
            }
            break;
          }
          case MatchResult.draw: {
            const white = playerStats[match.white];
            if (white) {
              white.draw += 1;
            }

            const black = playerStats[match.black];
            if (black) {
              black.draw += 1;
            }
            break;
          }
          case MatchResult.didNotStart: {
            const white = playerStats[match.white];
            if (white && match.white !== 'bye') {
              white.bye += 1;
            }

            const black = playerStats[match.black];
            if (black && match.black !== 'bye') {
              black.bye += 1;
            }
          }
        }

        if (match.white !== 'bye' && match.black !== 'bye') {
          const white = playerStats[match.white];
          const black = playerStats[match.black];

          if (white) {
            white.previousRating = match.whiteRating;
            white.rating = match.newWhiteRating || match.whiteRating;
            white.matchesPlayed = match.whiteMatchesPlayed;
            white.whitePlayed += 1;
            if (i === 0) {
              white.initialRating = match.whiteRating;
            }
          }

          if (black) {
            black.previousRating = match.blackRating;
            black.rating = match.newBlackRating || match.blackRating;
            black.matchesPlayed = match.blackMatchesPlayed;
            if (i === 0) {
              black.initialRating = match.blackRating;
            }
          }

          if (white) {
            if (playerStats[match.white]?.opponents[match.black]) {
              white.opponents[match.black] += 1;
            } else {
              white.opponents[match.black] = 1;
            }
          }

          if (black) {
            if (playerStats[match.black]?.opponents[match.white]) {
              black.opponents[match.white] += 1;
            } else {
              black.opponents[match.white] = 1;
            }
          }
        }
      }
    }
  }

  for (const playerId of Object.keys(playerStats)) {
    const player = playerStats[playerId];
    if (player) {
      playerStats[playerId] = {
        ...player,
        score: player.win + player.draw * 0.5 + player.bye * 0.5,
        pairingScore: player.win + player.draw * 0.5
      };
    }
  }

  return playerStats;
};

const findByePlayer = (stats: PlayerStats): string | undefined => {
  const entries = Object.entries(stats);

  if (entries.length % 2 === 1) {
    const sortedPlayers = entries
      .map(([id, value]) => ({
        id,
        pairingScore: value.pairingScore,
        rating: value.rating,
        bye: value.bye
      }))
      .sort(
        (a, b) =>
          b.bye - a.bye ||
          b.pairingScore - a.pairingScore ||
          b.rating - a.rating
      );

    const player = sortedPlayers.pop();

    if (player) {
      return player.id;
    }
  }
};

export const createMatch = (
  playerId: string,
  opponentId: string,
  stats: PlayerStats,
  boardNumber: number,
  tournamentId: string,
  boardTiebreakSeed: number
): Match => {
  const player = stats[playerId];
  const opponent = stats[opponentId];

  const whitePlayed = player?.whitePlayed || 0;
  const opponentWhitePlayed = opponent?.whitePlayed || 0;

  const white =
    whitePlayed === opponentWhitePlayed
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
    whiteRating: stats[white]?.rating || 0,
    blackRating: stats[black]?.rating || 0,
    whiteMatchesPlayed: (stats[white]?.matchesPlayed || 0) + 1,
    blackMatchesPlayed: (stats[black]?.matchesPlayed || 0) + 1,
    boardNumber,
    result: MatchResult.didNotStart,
    completed: false
  };
};

export const createNewRound = (
  tournament: Tournament,
  stats: PlayerStats, // A bunch of useful info about the players and their performance
  boardTiebreakSeed: number // Seed number used for tie breaking starting color
): Round => {
  // Filter out players that are no longer in the tournament
  for (const id of Object.keys(stats)) {
    if (!tournament.players.includes(id)) {
      delete stats[id];
    }
  }

  // Get the bye player - It's easier to do this first so we can exclude them from pairing logic
  const byePlayer = findByePlayer(stats);

  const matches = getMatches(tournament, stats, boardTiebreakSeed, byePlayer);

  if (byePlayer) {
    matches.push({
      _id: new mongoose.Types.ObjectId().toString(),
      tournamentId: tournament._id,
      white: byePlayer,
      black: 'bye',
      whiteScore: 0,
      blackScore: 0,
      whiteRating: stats[byePlayer]?.rating || 0,
      blackRating: 0,
      whiteMatchesPlayed: stats[byePlayer]?.matchesPlayed || 0,
      blackMatchesPlayed: 0,
      boardNumber: (matches[matches.length - 1]?.boardNumber || 0) + 1,
      result: MatchResult.didNotStart,
      completed: false
    });
  }

  // Need to return a Round which is basically an array of matches
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    completed: false,
    matches
  };
};

const getMatches = (
  tournament: Tournament,
  stats: PlayerStats,
  boardTiebreakSeed: number,
  byePlayer: Maybe<string>
): Match[] => {
  switch (tournament.pairingAlgorithm) {
    case EPairingAlgorithm.Swiss:
      return getSwissMatches(
        tournament._id,
        stats,
        boardTiebreakSeed,
        byePlayer,
        tournament.config.maxPunchDown
      );
    case EPairingAlgorithm.Rating:
      return getKongRatingMatches(
        tournament._id,
        stats,
        boardTiebreakSeed,
        byePlayer,
        tournament.config.performanceWeight
      );
  }
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
      bye: stat.bye,
      initialRating: stat.initialRating
    }))
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
};

// interface IFenMap {
//   fen: string;
//   advantage: number;
// }
//
// const a: IFenMap[] = [
//   {
//     fen: 'rnbqkbnr/pppp1ppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: 2.4
//   },
//   {
//     fen: 'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: 1.7
//   },
//   {
//     fen: 'rnbqkbnr/1ppppppp/p7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: 0.0
//   },
//   {
//     fen: 'rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -0.3
//   },
//   {
//     fen: 'r2qkbnr/pbpppppp/1pn5/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -0.4
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -0.7
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/6K1/PPPPPPPP/RNBQ1BNR w q - 0 1',
//     advantage: -0.8
//   },
//   {
//     fen: 'rnbqkbnr/ppp2ppp/8/3pp3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -1
//   },
//   {
//     fen: 'rnbqk2r/ppppppbp/5np1/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -1.2
//   },
//   {
//     fen: 'rn1qk1nr/pbppppbp/1p4p1/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -1.5
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -1.5
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/4K3/PPPPPPPP/RNBQ1BNR w kq - 0 1',
//     advantage: -1.7
//   },
//   {
//     fen: 'rn1qk1nr/ppp2ppp/8/2bppb2/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -1.7
//   },
//   {
//     fen: 'rnbqkbnr/pp4pp/8/2pppp2/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -2.1
//   },
//   {
//     fen: 'rnbq1rk1/ppppppbp/5np1/8/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -2.3
//   },
//   {
//     fen: 'rnbqkbnr/1p4pp/p7/2pppp2/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -2.8
//   },
//   {
//     fen: 'rnbqkb1r/pp4pp/5n2/2pppp2/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -3.2
//   },
//   {
//     fen: 'rn1qk1nr/pp4pp/3bb3/2pppp2/8/8/PPPPPPPP/RNBQKBNR w q - 0 1',
//     advantage: -3.3
//   },
//   {
//     fen: '4k3/8/rnbq1bnr/pppppppp/8/8/PPPPPPPP/RNBQKBNR w - - 0 1',
//     advantage: -3.8
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/4K3/8/8/PPPPPPPP/RNBQ1BNR w kq - 0 1',
//     advantage: -4.2
//   },
//   {
//     fen: 'rnbqkbnr/8/8/8/pppppppp/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//     advantage: -5.9
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PP3PPP/RNBQKBNR w Qkq - 0 1',
//     advantage: -6.2
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN1 w Qkq - 0 1',
//     advantage: -6.6
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1',
//     advantage: -7.6
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PP4PP/RNBQKBNR w Qkq - 0 1',
//     advantage: -7.8
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w Qkq - 0 1',
//     advantage: -8.2
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKBNR w Qkq - 0 1',
//     advantage: -8.5
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/P7/RNBQKBNR w Qkq - 0 1',
//     advantage: -8.7
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK1NR w Qkq - 0 1',
//     advantage: -9.1
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/P5PP/RNBQKBNR w Qkq - 0 1',
//     advantage: -9.2 //
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/8/RNBQKBNR w Qkq - 0 1',
//     advantage: -9.4
//   },
//   {
//     fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQkq - 0 1',
//     advantage: -12.5
//   }
// ];
