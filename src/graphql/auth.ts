import * as jwt from 'jsonwebtoken';
import UserModel from './user/UserModel';
import { jwtSecret } from '../config';
import type { User } from './user/UserTypes';

type GetUser = {
  user: User,
};

export const getUser = async (token: string): Promise<GetUser> => {
  if (!token) {
    return {
      user: null,
    };
  }

  try {
    const decodedToken = jwt.verify(token.substring(4), jwtSecret);

    // todo check this if I use it
    const user = await UserModel.findOne({ email: decodedToken });

    return {
      user,
    };
  } catch (err) {
    return {
      user: null,
    };
  }
};
