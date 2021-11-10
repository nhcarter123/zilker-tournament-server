import UserModel from './UserModel';
import type { User } from './UserTypes';
import type { Context } from '../TypeDefinitions';

type UpdateUserDetailsArgs = {
  firstName: string,
  lastName: string,
  rating: number,
};

type FindOneUser = {
  id: string,
};

type UserList = {
  users: User[],
  count: number,
};

const resolvers = {
  me: (_: void, args: void, context: Context): User => context.user,

  updateUserDetails: async (_: void, {
    args
  }: {args: UpdateUserDetailsArgs}, context: Context): Promise<User> => {

    return UserModel.findOneAndUpdate({_id: context.user.id}, args, { returnOriginal: false });
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
  user: async (user: User, args: FindOneUser): Promise<User> => {
    const { id } = args;

    return UserModel.findOne({ _id: id });
  }
};

export default resolvers;
