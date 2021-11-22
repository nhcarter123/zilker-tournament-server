import type { Context } from '../TypeDefinitions';
import { Match, MatchResult } from './MatchTypes';
import MatchModel from './MatchModel';

type GetMatchArgs = {
  matchId: string
};

type UpdateMatchArgs = {
  matchId: string;
  payload: {
    result: MatchResult
  }
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
  }
};

export default resolvers;
