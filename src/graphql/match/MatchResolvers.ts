import type { Context } from '../TypeDefinitions';
import { Match, MatchResult } from './MatchTypes';
import MatchModel from './MatchModel';
import TournamentModel, { TournamentMongo } from '../tournament/TournamentModel';

type GetMatchArgs = {
  matchId: string
};

type UpdateMatchArgs = {
  matchId: string;
  payload: {
    result: MatchResult
  }
}

type DeleteMatchArgs = {
  tournamentId: string;
  roundId: string;
  matchId: string;
}

const resolvers = {
  // Query
  getMyMatch: async (_: void, args: void, context: Context): Promise<Match | null> => {
    const user = context.user;

    return MatchModel.findOne({
      $and: [{
        completed: false
      }, {
        $or: [
          { white: user._id },
          { black: user._id }
        ]
      }]
    });
  },

  getMatch: async (_: void, { matchId }: GetMatchArgs): Promise<Match | null> => {
    return MatchModel.findOne({ _id: matchId });
  },

  // Mutation
  updateMatch: async (_: void, { matchId, payload }: UpdateMatchArgs): Promise<boolean> => {
    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found!');
    }

    await MatchModel.updateOne({ _id: matchId }, payload);

    return true;
  },

  deleteMatch: async (_: void, { tournamentId, roundId, matchId }: DeleteMatchArgs): Promise<boolean> => {
    // todo use context
    const tournament: TournamentMongo | null = await TournamentModel.findOne({
      _id: tournamentId
    });

    if (!tournament) {
      throw new Error('Tournament not found!');
    }

    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found!');
    }

    await MatchModel.deleteOne({ _id: matchId });

    await TournamentModel.updateOne(
      { _id: tournamentId, 'rounds._id': roundId },
      { $pull: { 'rounds.$.matches._id': matchId } }
    );

    return true;
  }
};

export default resolvers;
