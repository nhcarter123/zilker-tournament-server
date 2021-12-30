import type { Context } from '../TypeDefinitions';
import { MatchResult, MatchWithUserInfo } from './MatchTypes';
import MatchModel, { MatchMongo } from './MatchModel';
import { getRating } from '../tournament/helpers/ratingHelper';
import UserModel, { User } from '../user/UserModel';
import pubsub  from '../../pubsub/pubsub';
import { Subscription } from '../../pubsub/types';

type GetMatchArgs = {
  matchId: string
};

type UpdateMatchArgs = {
  matchId: string;
  payload: {
    result: MatchResult
  }
}

const withUserInfo = async (match: Nullable<MatchMongo>) => {
  if (!match) {
    return null;
  }

  let white: Nullable<User> = null;
  let black: Nullable<User> = null;

  if (match?.white !== 'bye') {
    white = await UserModel.findOne({ _id: match.white });
  }

  if (match?.black !== 'bye') {
    black = await UserModel.findOne({ _id: match.black });
  }

  return { ...match.toObject(), white, black };
}

const resolvers = {
  // Query
  getMyMatch: async (_: void, args: void, context: Context): Promise<Nullable<MatchWithUserInfo>> => {
    const user = context.user;

    const match = await MatchModel.findOne({
      $and: [{
        completed: false
      }, {
        $or: [
          { white: user._id },
          { black: user._id }
        ]
      }]
    });

    return withUserInfo(match)
  },

  getMatch: async (_: void, { matchId }: GetMatchArgs): Promise<Nullable<MatchWithUserInfo>> => {
    const match = await MatchModel.findOne({ _id: matchId });

    return withUserInfo(match)
  },

  // Mutation
  updateMatch: async (_: void, { matchId, payload }: UpdateMatchArgs): Promise<boolean> => {
    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found!');
    }

    let updatedMatch: Nullable<MatchMongo>;

    if (payload.result !== MatchResult.didNotStart) {
      const newWhiteRating = getRating(match.whiteRating, match.blackRating, payload.result, match.whiteMatchesPlayed, true);
      const newBlackRating = getRating(match.blackRating, match.whiteRating, payload.result, match.blackMatchesPlayed, false);

      updatedMatch = await MatchModel.findOneAndUpdate({ _id: matchId }, {
        ...payload,
        newWhiteRating,
        newBlackRating
      }, {new: true});
    } else {
      updatedMatch = await MatchModel.findOneAndUpdate({ _id: matchId }, {
        $set: { ...payload },
        $unset: { newWhiteRating: '', newBlackRating: '' }
      }, {new: true});
    }

    pubsub.publish(Subscription.MatchUpdated, { matchUpdated: updatedMatch?.toObject() });

    return true;
  }
};

export default resolvers;
