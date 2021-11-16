import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import tournamentResolvers from './tournament/TournamentResolvers';
import matchResolvers from './match/MatchResolvers';

type ResolversType = {
  Query: Object;
  Mutation: Object;
};

const globalResolvers: ResolversType = {
  Query: {
    // User
    me: userResolvers.me,
    getUser: userResolvers.getUser,

    // Tournament
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
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode,

    // Tournament
    nextRound: tournamentResolvers.nextRound,
    deleteRound: tournamentResolvers.deleteRound,
    createTournament: tournamentResolvers.createTournament,
    joinTournament: tournamentResolvers.joinTournament,

    // Match
    updateMatch: matchResolvers.updateMatch,
    deleteMatch: matchResolvers.deleteMatch
  }
};

export default globalResolvers;
