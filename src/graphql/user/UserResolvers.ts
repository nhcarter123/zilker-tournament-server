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

type GetUsersArgs = {
  userIds: string[],
  filterTerm?: string,
};

const resolvers = {
  // Query
  me: (_: void, args: void, context: Context): User => context.user,

  getUser: async (_: void, { userId }: getUserArgs): Promise<User | null> => {
    return UserModel.findOne({ _id: userId });
  },

  getUsers: async (_: void, { userIds, filterTerm }: GetUsersArgs): Promise<User[]> => {
    const query = filterTerm
      ? {
        _id: { $in: userIds },
        name: {
          $regex: new RegExp(`^${filterTerm}`, 'ig')
        }
      }
      : { _id: { $in: userIds } };

    return UserModel.find(query);
  },

  // Mutation
  updateUserDetails: async (_: void, {
    args
  }: { args: UpdateUserDetailsArgs }, context: Context): Promise<boolean> => {

    await UserModel.findOneAndUpdate({ _id: context.user.id }, args, { returnOriginal: false });

    return true;
  }
};

export default resolvers;
