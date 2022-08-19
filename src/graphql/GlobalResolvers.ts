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
import axios from 'axios';

type ResolversType = {
  Upload: Object;
  Query: Object;
  Mutation: Object;
  Subscription: Object;
};

// todo move these to helpers
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

const MINUTE = 60 * 1000;
const DAY = MINUTE * 60 * 24;

const withRateLimit = (fn: Function) => async (
  parent: void,
  args: void,
  context: Context
) => {
  const shortIntervalQuota = 4;
  const shortInterval = 30 * MINUTE;

  const longIntervalQuota = 9;
  const longInterval = DAY;

  const globalQuota = 500;

  const serverRequest = new RequestsModel({
    userAgent: context.userAgent,
    ip: context.ip
  });

  await serverRequest.save();

  const recentLimitedRequests = await RequestsModel.count({
    $or: [{ ip: context.ip }, { userAgent: context.userAgent }],
    createdAt: { $gte: Date.now() - shortInterval }
  });

  if (recentLimitedRequests > shortIntervalQuota) {
    throw new Error('Rate limit exceeded (Short)');
  }

  const dailyLimitedRequests = await RequestsModel.count({
    $or: [{ ip: context.ip }, { userAgent: context.userAgent }],
    createdAt: { $gte: Date.now() - longInterval }
  });

  if (dailyLimitedRequests > longIntervalQuota) {
    throw new Error('Rate limit exceeded (Long)');
  }

  const dailyGlobalRequests = await RequestsModel.count({
    createdAt: { $gte: Date.now() - longInterval }
  });

  if (dailyGlobalRequests > globalQuota) {
    throw new Error('Rate limit exceeded (Global)');
  }

  return fn(parent, args, context);
};

const withRecaptcha = (fn: Function) => async (
  parent: void,
  args: { token: string },
  context: Context
) => {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${args.token}`;

  const response = await axios.get(url);

  if (response.data.score < 0.5) {
    throw new Error('Suspicious device detected');
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
    verifyCode: withRateLimit(verificationCodeResolvers.verifyCode),
    verifyPhone: withRecaptcha(
      withRateLimit(verificationCodeResolvers.verifyPhone)
    ),
    verifyEmail: withRecaptcha(
      withRateLimit(verificationCodeResolvers.verifyEmail)
    ),
    loginEmail: withRecaptcha(
      withRateLimit(verificationCodeResolvers.loginEmail)
    ),

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
