import { GraphQLUpload } from 'graphql-upload';
import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import tournamentResolvers from './tournament/TournamentResolvers';
import matchResolvers from './match/MatchResolvers';
import organizationResolvers from './organization/OrganizationResolvers';
import pubsub from '../pubsub/pubsub';
import { Subscription } from '../pubsub/types';
import { withFilter } from 'graphql-subscriptions';
import { Context } from './TypeDefinitions';
import RequestsModel from './verificationCode/ServerRequestModel';

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

const withRateLimit = (fn: Function, limit = 5, interval = 5 * 1000) => async (
  parent: void,
  args: void,
  context: Context
) => {
  const serveRequest = new RequestsModel({
    userAgent: context.userAgent,
    ip: context.ip
  });

  await serveRequest.save();

  const recentServerRequests = await RequestsModel.count({
    $or: [{ ip: context.ip }, { userAgent: context.userAgent }],
    createdAt: { $gte: Date.now() - interval }
  });

  if (recentServerRequests > limit) {
    throw new Error('Rate limit exceeded');
  }

  return fn(parent, args, context);
};

const globalResolvers: ResolversType = {
  Upload: GraphQLUpload,
  Query: {
    // User
    me: userResolvers.me,
    getUsers: userResolvers.getUsers,

    // Tournament
    getMyTournament: withAuth(tournamentResolvers.getMyTournament),
    getTournaments: tournamentResolvers.getTournaments,
    getTournament: tournamentResolvers.getTournament,
    getRound: tournamentResolvers.getRound,

    // Match
    getMatch: matchResolvers.getMatch,
    getMyMatch: withAuth(matchResolvers.getMyMatch),

    // Organization
    getOrganization: withAuth(organizationResolvers.getOrganization),
    getOrganizations: withAuth(organizationResolvers.getOrganizations)
  },
  Mutation: {
    // User
    updateUserDetails: withAuth(userResolvers.updateUserDetails),
    uploadPhoto: withAuth(userResolvers.uploadPhoto),
    deletePhoto: withAuth(userResolvers.deletePhoto),
    verifyCode: verificationCodeResolvers.verifyCode,
    verifyPhone: withRateLimit(verificationCodeResolvers.verifyPhone),
    verifyEmail: withRateLimit(verificationCodeResolvers.verifyEmail),
    loginEmail: withRateLimit(verificationCodeResolvers.loginEmail),

    // Tournament
    createTournament: withAuth(tournamentResolvers.createTournament),
    updateTournament: withAuth(tournamentResolvers.updateTournament),
    completeRound: withAuth(tournamentResolvers.completeRound),
    deleteRound: withAuth(tournamentResolvers.deleteRound),
    joinTournament: withAuth(tournamentResolvers.joinTournament),
    kickPlayer: withAuth(tournamentResolvers.kickPlayer),
    uploadTournamentPhoto: withAuth(tournamentResolvers.uploadTournamentPhoto),
    deleteTournamentPhoto: withAuth(tournamentResolvers.deleteTournamentPhoto),

    // Match
    updateMatch: withAuth(matchResolvers.updateMatch),

    // Organization
    createOrganization: withAuth(organizationResolvers.createOrganization),
    updateOrganization: withAuth(organizationResolvers.updateOrganization)
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
