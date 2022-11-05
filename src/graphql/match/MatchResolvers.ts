import type { VerifiedContext } from '../TypeDefinitions';
import { IHistoryResult, Match, MatchResult, MatchWithUserInfo } from './MatchTypes';
import MatchModel from './MatchModel';
import { getRating } from '../tournament/helpers/ratingHelper';
import UserModel from '../user/UserModel';
import pubsub from '../../pubsub/pubsub';
import { ChallengeUpdated, MatchUpdated, Subscription } from '../../pubsub/types';
import {
  mapToMatch,
  mapToMatches,
  mapToTournaments,
  mapToUser,
  mapToUsers
} from '../../mappers/mappers';
import { User } from '../user/UserTypes';
import { compact, find, uniq } from 'lodash';
import TournamentModel from '../tournament/TournamentModel';
import { createMatch, getPlayerStats } from '../tournament/helpers/pairingHelper';

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

type TJoinMatchArgs = {
  gameCode: string;
}

type TLeaveMatchArgs = {
  matchId: string;
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

export const addHistoryToMatch = async (match: Match): Promise<Match> => {
  let whiteScore = 0;
  let blackScore = 0;

  if (match.black !== 'bye') {
    const matchHistories = await MatchModel.find({
      $or: [
        { white: match.white, black: match.black },
        { white: match.black, black: match.white }
      ]
    }).then(mapToMatches);

    for (const history of matchHistories) {
      if (history.result === MatchResult.WhiteWon) {
        if (history.white === match.white) {
          whiteScore += 1;
        } else {
          blackScore += 1;
        }
      }

      if (history.result === MatchResult.BlackWon) {
        if (history.black === match.black) {
          blackScore += 1;
        } else {
          whiteScore += 1;
        }
      }

      if (history.result === MatchResult.Draw) {
        blackScore += 0.5;
        whiteScore += 0.5;
      }
    }
  }

  return { ...match, whiteScore, blackScore };
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
      return null;
    }

    const matchWithHistory = await addHistoryToMatch(match);

    return withUserInfo(matchWithHistory);
  },

  getMyChallengeMatch: async (_: void, _args: void, context: VerifiedContext): Promise<Nullable<MatchWithUserInfo>> => {
    const user = context.user;

    const match = await MatchModel.findOne({
      tournamentId: null,
      completed: false,
      $or: [
        { white: user._id },
        { black: user._id }
      ]
    }).then(mapToMatch);

    if (!match) {
      return null;
    }

    const matchWithHistory = await addHistoryToMatch(match);

    return withUserInfo(matchWithHistory);
  },

  getMyMatchHistory: async (_: void, _args: void, context: VerifiedContext): Promise<IHistoryResult> => {
    const user = context.user;

    const matches = await MatchModel.find({
      completed: true,
      $or: [
        { white: user._id },
        { black: user._id }
      ]
    }).sort({ createdAt: -1 }).then(
      mapToMatches
    );

    const userIds = uniq(matches
      .flatMap(match => [match.white, match.black])
      .filter(id => id !== 'bye'));

    const users = await UserModel.find({ _id: { $in: userIds } }).then(
      mapToUsers
    );

    const tournamentIds = uniq(matches
      .map(match => match.tournamentId));

    const tournaments = await TournamentModel.find({ _id: { $in: tournamentIds } }).then(mapToTournaments);

    return {
      tournaments,
      matches: matches.map(match => ({
        ...match,
        white: find(users, user => user._id === match.white) || null,
        black: find(users, user => user._id === match.black) || null
      }))
    };
  },

  getMatch: async (_: void, { matchId }: GetMatchArgs): Promise<Nullable<MatchWithUserInfo>> => {
    const match = await MatchModel.findOne({ _id: matchId }).then(mapToMatch);

    if (!match) {
      return null;
    }

    const matchWithHistory = await addHistoryToMatch(match);

    return withUserInfo(matchWithHistory);
  },

  // Mutation
  updateMatch: async (_: void, { matchId, payload }: UpdateMatchArgs): Promise<boolean> => {
    const match = await MatchModel.findOne({ _id: matchId });

    if (!match) {
      throw new Error('Match not found');
    }

    let updatedMatch: Nullable<Match>;

    if (payload.result !== MatchResult.DidNotStart) {
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
      const matchWithHistory = await addHistoryToMatch(updatedMatch);

      const matchUpdated = await withUserInfo(matchWithHistory);
      await pubsub.publish<MatchUpdated>(Subscription.MatchUpdated, { matchUpdated });
    }

    return true;
  },

  joinChallenge: async (_: void, { gameCode }: TJoinMatchArgs, context: VerifiedContext): Promise<boolean> => {
    const challenger = await UserModel.findOne({ 'challenge.gameCode': gameCode }).then(mapToUser);

    if (!challenger) {
      throw new Error('Challenge not found');
    }

    const isChallengerInAMatch = await MatchModel.findOne({
      tournamentId: null,
      completed: false,
      $or: [
        { white: challenger._id },
        { black: challenger._id }
      ]
    });

    if (isChallengerInAMatch) {
      throw new Error('Challenger is in another match');
    }

    const stats = getPlayerStats([], [challenger, context.user]);

    const match = createMatch(context.user._id, challenger._id, stats, null, challenger._id);

    const dbMatch = new MatchModel(match);
    await dbMatch.save();

    await pubsub.publish<ChallengeUpdated>(Subscription.ChallengeUpdated, {
      challengeUpdated: {
        hostId: match.hostId || '',
        completed: false
      }
    });

    return true;
  },

  endChallenge: async (_: void, { matchId }: TLeaveMatchArgs): Promise<boolean> => {
    const matchFilter = { _id: matchId, tournamentId: null };

    const currentMatch = await MatchModel.findOne(matchFilter).then(mapToMatch);

    if (!currentMatch) {
      throw new Error('Match not found');
    }

    if (!currentMatch.completed) {
      if (currentMatch.result === MatchResult.DidNotStart) {
        await MatchModel.deleteOne(matchFilter);
      } else {
        await MatchModel.findOneAndUpdate(matchFilter, { completed: true });
        const matchWithUserInfo = await withUserInfo(currentMatch);

        const stats = getPlayerStats([{
          _id: '',
          completed: false,
          matches: [currentMatch]
        }], compact([matchWithUserInfo.white, matchWithUserInfo.black]));

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
      }

      await pubsub.publish<ChallengeUpdated>(Subscription.ChallengeUpdated, {
        challengeUpdated: {
          hostId: currentMatch.hostId || '',
          completed: true
        }
      });
    }

    return true;
  }
};

export default resolvers;
