import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';

type ResolversType = {
  Query: Object;
  Mutation: Object;
};

const globalResolvers: ResolversType = {
  Query: {
    me: userResolvers.me,
    users: userResolvers.users,
    user: userResolvers.user
  },
  Mutation: {
    updateUserDetails: userResolvers.updateUserDetails,
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode
  }
};

export default globalResolvers;
