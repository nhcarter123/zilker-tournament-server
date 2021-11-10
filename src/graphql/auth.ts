import * as dotenv from 'dotenv';
dotenv.config();

import * as jwt from 'jsonwebtoken';
import UserModel from './user/UserModel';
import type { User } from './user/UserTypes';
import { JwtPayload } from 'jsonwebtoken';

type GetUser = {
  user: User,
};

export const getUser = async (token: string): Promise<GetUser> => {
  if (!token.length) {
    return {
      user: null
    };
  }

  const decodedToken = jwt.verify(token.substring(7), process.env.SECRET) as JwtPayload;

  const user = await UserModel.findOne({ phone: decodedToken.id });

  return {
    user
  };
};
