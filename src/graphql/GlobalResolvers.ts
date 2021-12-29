import { GraphQLUpload } from 'graphql-upload';
import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import tournamentResolvers from './tournament/TournamentResolvers';
import matchResolvers from './match/MatchResolvers';
import pubsub from '../pubsub/pubsub';
import { Subscription } from '../pubsub/types';
import { withFilter } from 'graphql-subscriptions';

type ResolversType = {
  Upload: Object;
  Query: Object;
  Mutation: Object;
  Subscription: Object;
};

const globalResolvers: ResolversType = {
  Upload: GraphQLUpload,
  Query: {
    // User
    me: userResolvers.me,
    getUser: userResolvers.getUser,
    getUsers: userResolvers.getUsers,

    // Tournament
    getUpcomingTournaments: tournamentResolvers.getUpcomingTournaments,
    getActiveTournament: tournamentResolvers.getActiveTournament,
    getTournaments: tournamentResolvers.getTournaments,
    getTournament: tournamentResolvers.getTournament,
    getRound: tournamentResolvers.getRound,

    // Match
    getMatch: matchResolvers.getMatch,
    getMyMatch: matchResolvers.getMyMatch
  },
  Mutation: {
    // User
    updateUserDetails: userResolvers.updateUserDetails,
    uploadPhoto: userResolvers.uploadPhoto,
    deletePhoto: userResolvers.deletePhoto,
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode,

    // Tournament
    createTournament: tournamentResolvers.createTournament,
    updateTournament: tournamentResolvers.updateTournament,
    completeRound: tournamentResolvers.completeRound,
    deleteRound: tournamentResolvers.deleteRound,
    joinTournament: tournamentResolvers.joinTournament,
    kickPlayer: tournamentResolvers.kickPlayer,

    // Match
    updateMatch: matchResolvers.updateMatch
  },
  Subscription: {
    matchUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(Subscription.MatchUpdated),
        (payload, variables) =>
          variables.matchIds.includes(payload.matchUpdated._id)
      )
    },
    newRoundStarted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(Subscription.NewRoundStarted),
        (payload, variables) =>
          variables.tournamentId === payload.newRoundStarted.tournamentId
      )
    }
  }
};

export default globalResolvers;
