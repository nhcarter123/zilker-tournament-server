import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import tournamentResolvers from './tournament/TournamentResolvers';

type ResolversType = {
  Query: Object;
  Mutation: Object;
};

const globalResolvers: ResolversType = {
  Query: {
    me: userResolvers.me,
    getActiveTournament: tournamentResolvers.getActiveTournament,
    getTournaments: tournamentResolvers.getTournaments,
    getTournament: tournamentResolvers.getTournament,
    users: userResolvers.users,
    user: userResolvers.user
  },
  Mutation: {
    nextRound: tournamentResolvers.nextRound,
    joinTournament: tournamentResolvers.joinTournament,
    createTournament: tournamentResolvers.createTournament,
    updateUserDetails: userResolvers.updateUserDetails,
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode
  }
};

export default globalResolvers;
