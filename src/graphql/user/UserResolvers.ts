import { generateToken } from '../utils';
import { ConnectionArgs } from '../posts/PostResolvers';
import UserModel from './UserModel';
import type { UserAuth, User } from './UserTypes';
import type { Context } from '../TypeDefinitions';

type UserAdd = {
  email: string,
  name: string,
  password: string,
};

type FindOneUser = {
  id: string,
};

type UserList = {
  users: User[],
  count: number,
};

const resolvers = {
  me: (user: User, args: void, context: Context): User => context.user,
  users: async (user: User, args: ConnectionArgs): Promise<UserList> => {
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
  },

  addUser: async (obj: User, args: UserAdd): Promise<UserAuth> => {
    const { email, name, password } = args;

    if (!email || !name || !password) {
      throw new Error('Please fill all the fields');
    }

    const checkEmail = UserModel.findOne({
      email
    });

    if (!checkEmail) {
      throw new Error('This email is already registered!');
    }

    const user = new UserModel({
      name,
      email,
      password
    });

    await user.save();

    return {
      refreshToken: generateToken(user),
      accessToken: generateToken(user)
    };
  }
};

export default resolvers;
