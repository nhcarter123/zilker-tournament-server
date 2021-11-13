import TournamentModel, { TournamentMongo } from './TournamentModel';
import {
  TournamentStatus,
  TournamentResponse,
  RoundPreview,
  Round
} from './TournamentTypes';
import { createNewRound, getPlayerStats } from './helpers';
import UserModel from '../user/UserModel';
import MatchModel from '../match/MatchModel';
import { find } from 'lodash';
import { Match } from '../match/MatchTypes';

type CreateTournamentArgs = {
  name: string;
};

type JoinTournamentArgs = {
  tournamentId: string;
  userId: string;
};

type GetTournamentArgs = {
  tournamentId: string;
};

type NextRoundArgs = {
  tournamentId: string;
};

const resolvers = {
  // Queries
  getActiveTournament: async (): Promise<TournamentMongo | null> => {
    return TournamentModel.findOne({
      $and: [
        {
          status: { $ne: TournamentStatus.completed }
        },
        {
          status: { $ne: TournamentStatus.inactive }
        }
      ]
    });
  },

  getTournament: async (
    _: void,
    { tournamentId }: GetTournamentArgs
  ): Promise<TournamentMongo | null> => {
    return TournamentModel.findOne({ _id: tournamentId });
  },

  getTournaments: async (): Promise<TournamentResponse[]> => {
    return TournamentModel.find({});
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

  nextRound: async (
    _: void,
    { tournamentId }: NextRoundArgs
  ): Promise<boolean> => {
    const tournament: TournamentMongo | null = await TournamentModel.findOne({
      _id: tournamentId
    });

    if (!tournament) {
      throw new Error('Unknown tournament!');
    }

    const matches = await MatchModel.find({
      _id: {
        $in: tournament.rounds.flatMap((round: RoundPreview) => round.matches)
      }
    });

    const rounds: Round[] = tournament.rounds.map((round: RoundPreview) => ({
      ...round,
      matches: round.matches.map(_id =>
        find(matches, match => match._id === _id)
      ) as Match[], // this typecast is a risk I'm willing to take
      completed: true
    }));

    const players = await UserModel.find({
      _id: { $in: tournament.players }
    });

    const stats = getPlayerStats(rounds, players);

    const newRound = createNewRound(stats);

    const newMatches = await MatchModel.insertMany(newRound.matches);

    const newRoundPreview: RoundPreview = {
      ...newRound,
      matches: newMatches.map(match => match._id)
    };

    rounds.push();

    await TournamentModel.updateOne(
      { _id: tournamentId },
      { rounds: [...tournament.rounds, newRoundPreview] }
    );

    return true;
  }
};

export default resolvers;
