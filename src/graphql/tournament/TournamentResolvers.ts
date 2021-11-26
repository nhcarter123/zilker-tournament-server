import { find, uniq } from 'lodash';
import moment from 'moment';
import TournamentModel, { TournamentMongo } from './TournamentModel';
import {
  Round,
  RoundPreview,
  TournamentResponse,
  TournamentStatus
} from './TournamentTypes';
import {
  createNewRound,
  createStandings,
  getPlayerStats
} from './helpers/pairingHelper';
import UserModel from '../user/UserModel';
import MatchModel from '../match/MatchModel';
import { Match, MatchResult } from '../match/MatchTypes';

type CreateTournamentArgs = {
  name: string;
};

type UpdateTournamentArgs = {
  tournamentId: string;
  payload: UpdateTournamentPayload;
};

type UpdateTournamentPayload = {
  name?: string;
  isDeleted?: boolean;
};

type JoinTournamentArgs = {
  tournamentId: string;
  userId: string;
};

type KickPlayerArgs = {
  tournamentId: string;
  userId: string;
};

type GetTournamentArgs = {
  tournamentId: string;
};

type GetRoundArgs = {
  tournamentId: string;
  roundId: string;
};

type DeleteRoundArgs = {
  tournamentId: string;
  roundId: string;
};

type completeRoundArgs = {
  tournamentId: string;
  newRound: boolean;
};

const resolvers = {
  // Queries
  getActiveTournament: async (): Promise<TournamentMongo | null> => {
    return TournamentModel.findOne({ status: TournamentStatus.active });
  },

  getUpcomingTournaments: async (): Promise<TournamentMongo[]> => {
    return TournamentModel.find({
      status: TournamentStatus.created,
      date: {
        $gt: moment()
          .startOf('day')
          .toDate()
      }
    });
  },

  getTournament: async (
    _: void,
    { tournamentId }: GetTournamentArgs
  ): Promise<TournamentMongo | null> => {
    return TournamentModel.findOne({ _id: tournamentId });
  },

  getTournaments: async (): Promise<TournamentResponse[]> => {
    return TournamentModel.find({ isDeleted: false });
  },

  // Mutations
  createTournament: async (
    _: void,
    { name }: CreateTournamentArgs
  ): Promise<boolean> => {
    const tournament = new TournamentModel({
      name
    });

    await tournament.save();

    return true;
  },

  updateTournament: async (
    _: void,
    { tournamentId, payload }: UpdateTournamentArgs
  ): Promise<boolean> => {
    await TournamentModel.findOneAndUpdate({ _id: tournamentId }, payload);

    return true;
  },

  joinTournament: async (
    _: void,
    { tournamentId, userId }: JoinTournamentArgs
  ): Promise<boolean> => {
    await TournamentModel.updateOne(
      { _id: tournamentId },
      { $addToSet: { players: userId } }
    );

    return true;
  },

  kickPlayer: async (
    _: void,
    { tournamentId, userId }: KickPlayerArgs
  ): Promise<boolean> => {
    await TournamentModel.updateOne(
      { _id: tournamentId },
      { $pull: { players: userId } }
    );

    return true;
  },

  getRound: async (
    _: void,
    { tournamentId, roundId }: GetRoundArgs
  ): Promise<Round | null> => {
    // todo use context
    const tournament: TournamentMongo | null = await TournamentModel.findOne({
      _id: tournamentId
    });

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    const round = find(
      tournament.rounds,
      round => round._id.toString() === roundId
    );

    if (!round) {
      throw new Error('Round not found!');
    }

    const matches = await MatchModel.find({ _id: { $in: round.matches } });

    return {
      _id: roundId,
      completed: false,
      matches
    };
  },

  deleteRound: async (
    _: void,
    { tournamentId, roundId }: DeleteRoundArgs
  ): Promise<boolean> => {
    // todo use context
    const tournamentModel: TournamentMongo | null = await TournamentModel.findOne(
      {
        _id: tournamentId
      }
    );

    if (!tournamentModel) {
      throw new Error('Tournament not found!');
    }

    const tournament = tournamentModel.toObject();

    const round = find(
      tournament.rounds,
      round => round._id.toString() === roundId
    );

    if (!round) {
      throw new Error('Round not found!');
    }

    // todo abstract all this repeated code - had to do this for crunch
    // get all matches
    const matches = await MatchModel.find({
      _id: {
        $in: tournament.rounds.flatMap((round: RoundPreview) => round.matches)
      }
    });

    const rounds: Round[] = tournament.rounds.map((round: RoundPreview) => ({
      ...round,
      matches: round.matches
        .map(_id => find(matches, match => match._id.toString() === _id))
        .flatMap(v => (v ? [v] : []))
    }));

    const userIds = uniq(
      rounds
        .flatMap(round =>
          round.matches.flatMap(match => [match.white, match.black])
        )
        .concat(tournament.players)
        .filter(id => id !== 'bye')
    );

    const players = await UserModel.find({
      _id: { $in: userIds }
    });

    const stats = getPlayerStats(rounds, players);

    await UserModel.bulkWrite(
      Object.entries(stats).map(([userId, stat]) => ({
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              rating: stat.previousRating,
              matchesPlayed: stat.matchesPlayed - 1
            }
          }
        }
      }))
    );

    const updatedRounds = rounds.filter(
      round => round._id.toString() !== roundId
    );
    const standings = createStandings(getPlayerStats(updatedRounds, players));

    await MatchModel.deleteMany({ _id: { $in: round.matches } });

    await TournamentModel.updateOne(
      { _id: tournamentId },
      { $pull: { rounds: { _id: round._id } }, standings }
    );

    return true;
  },

  completeRound: async (
    _: void,
    { tournamentId, newRound }: completeRoundArgs
  ): Promise<boolean> => {
    // todo use context
    const tournament: TournamentMongo | null = await TournamentModel.findOne({
      _id: tournamentId
    });

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    // add results to all of last round's matches if they have none
    const index = tournament.rounds.length - 1;

    if (index !== -1) {
      const lastRoundsMatches = tournament.rounds[index].matches;

      await MatchModel.updateMany(
        {
          $and: [
            {
              _id: { $in: lastRoundsMatches }
            },
            { result: { $exists: false } }
          ]
        },
        { $set: { result: MatchResult.didNotStart } }
      );

      // complete all rounds
      await MatchModel.updateMany(
        {
          _id: { $in: lastRoundsMatches }
        },
        { $set: { completed: true } }
      );
    }

    // get all matches
    const matches = await MatchModel.find({
      _id: {
        $in: tournament.rounds.flatMap((round: RoundPreview) => round.matches)
      }
    });

    const rounds: Round[] = tournament.rounds.map((round: RoundPreview) => ({
      ...round,
      matches: round.matches
        .map(_id => find(matches, match => match._id.toString() === _id))
        .filter(v => v) as Match[]
    }));

    const userIds = uniq(
      rounds
        .flatMap(round =>
          round.matches.flatMap(match => [match.white, match.black])
        )
        .concat(tournament.players)
        .filter(id => id !== 'bye')
    );

    const players = await UserModel.find({
      _id: { $in: userIds }
    });

    const stats = getPlayerStats(rounds, players);

    const standings = createStandings(stats);
    const nextRound = createNewRound(
      tournamentId,
      stats,
      tournament.players,
      8
    );

    const updatedRounds = tournament.rounds.map(round => ({
      _id: round._id,
      matches: round.matches,
      completed: true
    }));

    if (newRound) {
      const newMatches = await MatchModel.insertMany(nextRound.matches);

      updatedRounds.push({
        ...nextRound,
        matches: newMatches.map(match => match._id)
      });
    }

    await UserModel.bulkWrite(
      Object.entries(stats).map(([userId, stat]) => ({
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              rating: stat.rating,
              matchesPlayed: stat.matchesPlayed
            }
          }
        }
      }))
    );

    await TournamentModel.updateOne(
      { _id: tournamentId },
      {
        rounds: updatedRounds,
        standings
      }
    );

    return true;
  }
};

export default resolvers;
