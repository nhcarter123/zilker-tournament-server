import * as dotenv from 'dotenv';
dotenv.config();

import * as jwt from 'jsonwebtoken';
import UserModel, { User } from './user/UserModel';
import { JwtPayload } from 'jsonwebtoken';

type GetUser = {
  user: User | null;
};

export const getUser = async (token: string): Promise<GetUser> => {
  try {
    const decodedToken = jwt.verify(
      token.substring(7),
      `${process.env.SECRET}`
    ) as JwtPayload;

    const user = await UserModel.findOne({ phone: decodedToken.id });

    return {
      user
    };
  } catch (e) {
    return {
      user: null
    };
  }
};
