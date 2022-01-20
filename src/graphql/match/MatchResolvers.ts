import type { VerifiedContext } from '../TypeDefinitions';
import { Match, MatchResult, MatchWithUserInfo } from './MatchTypes';
import MatchModel from './MatchModel';
import { getRating } from '../tournament/helpers/ratingHelper';
import UserModel from '../user/UserModel';
import pubsub from '../../pubsub/pubsub';
import { MatchUpdated, Subscription } from '../../pubsub/types';
import { mapToMatch, mapToUser } from '../../mappers/mappers';
import { User } from '../user/UserTypes';

type GetMyMatchArgs = {
  tournamentId: string
};

type GetMatchArgs = {
  matchId: string
};

type UpdateMatchArgs = {
  matchId: string;
  payload: {
    result: MatchResult
  }
}

const withUserInfo = async (match: Match): Promise<MatchWithUserInfo> => {
  let white: Nullable<User> = null;
  let black: Nullable<User> = null;

  if (match?.white !== 'bye') {
    white = await UserModel.findOne({ _id: match.white }).then(mapToUser);
  }

  if (match?.black !== 'bye') {
    black = await UserModel.findOne({ _id: match.black }).then(mapToUser);
  }

  return { ...match, white, black };
};

const resolvers = {
  // Query
  getMyMatch: async (_: void, { tournamentId }: GetMyMatchArgs, context: VerifiedContext): Promise<Nullable<MatchWithUserInfo>> => {
    const user = context.user;

    const match = await MatchModel.findOne({
      tournamentId,
      completed: false,
      $or: [
        { white: user._id },
        { black: user._id }
      ]
    }).then(mapToMatch);

    if (!match) {
      return null
    }

    return withUserInfo(match);
  },

  getMatch: async (_: void, { matchId }: GetMatchArgs): Promise<Nullable<MatchWithUserInfo>> => {
    const match = await MatchModel.findOne({ _id: matchId }).then(mapToMatch);

    if (!match) {
      return null
    }

    return withUserInfo(match);
  },

  // Mutation
  updateMatch: async (_: void, { matchId, payload }: UpdateMatchArgs): Promise<boolean> => {
    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found!');
    }

    let updatedMatch: Nullable<Match>;

    if (payload.result !== MatchResult.didNotStart) {
      const newWhiteRating = getRating(match.whiteRating, match.blackRating, payload.result, match.whiteMatchesPlayed, true);
      const newBlackRating = getRating(match.blackRating, match.whiteRating, payload.result, match.blackMatchesPlayed, false);

      updatedMatch = await MatchModel.findOneAndUpdate({ _id: matchId }, {
        ...payload,
        newWhiteRating,
        newBlackRating
      }, { new: true }).then(mapToMatch);
    } else {
      updatedMatch = await MatchModel.findOneAndUpdate({ _id: matchId }, {
        $set: { ...payload },
        $unset: { newWhiteRating: '', newBlackRating: '' }
      }, { new: true }).then(mapToMatch);
    }

    if (updatedMatch) {
      const matchUpdated = await withUserInfo(updatedMatch)
      pubsub.publish<MatchUpdated>(Subscription.MatchUpdated, { matchUpdated });
    }

    return true;
  }
};

export default resolvers;
