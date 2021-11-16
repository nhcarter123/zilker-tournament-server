import UserModel from './UserModel';
import type { User } from './UserTypes';
import type { Context } from '../TypeDefinitions';

type UpdateUserDetailsArgs = {
  firstName?: string,
  lastName?: string,
  rating?: number,
};

type getUserArgs = {
  userId: string,
};

type UserList = {
  users: User[],
  count: number,
};

const resolvers = {
  // Query
  me: (_: void, args: void, context: Context): User => context.user,

  getUser: async (_: void, { userId }: getUserArgs): Promise<User | null> => {
    return UserModel.findOne({ _id: userId });
  },

  users: async (user: User, args: any): Promise<UserList> => {
    const { search, after, first } = args;

    const where = search
      ? {
        name: {
          $regex: new RegExp(`^${search}`, 'ig')
        }
      }
      : {};

    const users = !after
      ? await UserModel.find(where).limit(first)
      : await UserModel.find(where)
        .skip(after)
        .limit(first);

    return { users, count: await UserModel.count() };
  },

  // Mutation
  updateUserDetails: async (_: void, {
    args
  }: {args: UpdateUserDetailsArgs}, context: Context): Promise<boolean> => {

    await UserModel.findOneAndUpdate({_id: context.user.id}, args, { returnOriginal: false });

    return true
  },
};

export default resolvers;
