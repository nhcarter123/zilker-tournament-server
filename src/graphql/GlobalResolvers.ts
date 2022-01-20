import { GraphQLUpload } from 'graphql-upload';
import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import tournamentResolvers from './tournament/TournamentResolvers';
import matchResolvers from './match/MatchResolvers';
import pubsub from '../pubsub/pubsub';
import { Subscription } from '../pubsub/types';
import { withFilter } from 'graphql-subscriptions';
import { Context } from './TypeDefinitions';

type ResolversType = {
  Upload: Object;
  Query: Object;
  Mutation: Object;
  Subscription: Object;
};

const withAuth = (fn: Function) => (
  parent: void,
  args: void,
  context: Context
) => {
  if (!context.user) {
    throw 'Unauthorized';
  }

  return fn(parent, args, context);
};

const globalResolvers: ResolversType = {
  Upload: GraphQLUpload,
  Query: {
    // User
    me: userResolvers.me,
    getUser: withAuth(userResolvers.getUser),
    getUsers: withAuth(userResolvers.getUsers),

    // Tournament
    getMyTournament: withAuth(tournamentResolvers.getMyTournament),
    getTournaments: withAuth(tournamentResolvers.getTournaments),
    getTournament: withAuth(tournamentResolvers.getTournament),
    getRound: withAuth(tournamentResolvers.getRound),

    // Match
    getMatch: withAuth(matchResolvers.getMatch),
    getMyMatch: withAuth(matchResolvers.getMyMatch)
  },
  Mutation: {
    // User
    updateUserDetails: withAuth(userResolvers.updateUserDetails),
    uploadPhoto: withAuth(userResolvers.uploadPhoto),
    deletePhoto: withAuth(userResolvers.deletePhoto),
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode,
    // Tournament
    createTournament: withAuth(tournamentResolvers.createTournament),
    updateTournament: withAuth(tournamentResolvers.updateTournament),
    completeRound: withAuth(tournamentResolvers.completeRound),
    deleteRound: withAuth(tournamentResolvers.deleteRound),
    joinTournament: withAuth(tournamentResolvers.joinTournament),
    kickPlayer: withAuth(tournamentResolvers.kickPlayer),

    // Match
    updateMatch: withAuth(matchResolvers.updateMatch)
  },
  Subscription: {
    matchUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(Subscription.MatchUpdated),
        (payload, variables) =>
          variables.matchIds.includes(payload.matchUpdated._id)
      )
    },
    tournamentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(Subscription.TournamentUpdated),
        (payload, variables) =>
          variables.tournamentIds.includes(
            payload.tournamentUpdated.tournament._id
          )
      )
    }
  }
};

export default globalResolvers;
