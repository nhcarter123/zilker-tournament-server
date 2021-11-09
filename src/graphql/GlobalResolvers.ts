import userResolvers from './user/UserResolvers';
import verificationCodeResolvers from './verificationCode/VerificationCodeResolvers';
import postResolvers from './posts/PostResolvers';

type ResolversType = {
  Query: Object;
  Mutation: Object;
};

const globalResolvers: ResolversType = {
  Query: {
    me: userResolvers.me,
    users: userResolvers.users,
    user: userResolvers.user,
    post: postResolvers.post,
    posts: postResolvers.posts
  },
  Mutation: {
    verifyCode: verificationCodeResolvers.verifyCode,
    sendVerificationCode: verificationCodeResolvers.sendVerificationCode,
    addUser: userResolvers.addUser,
    postAdd: postResolvers.postAdd
  }
};

export default globalResolvers;
