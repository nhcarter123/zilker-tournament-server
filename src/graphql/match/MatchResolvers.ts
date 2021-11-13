import UserModel from './MatchModel';
import type { User } from '../user/UserTypes';
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
  getMatch: (_: void, args: void, context: Context): User => context.user,
};

export default resolvers;
