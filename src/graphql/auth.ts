import * as jwt from 'jsonwebtoken';
import UserModel from './user/UserModel';
import { JwtPayload } from 'jsonwebtoken';
import { mapToUser } from '../mappers/mappers';
import { User } from './user/UserTypes';

export const getUser = async (token: string): Promise<Nullable<User>> => {
  try {
    const decodedToken = jwt.verify(
      token.substring(7),
      `${process.env.SECRET}`
    ) as JwtPayload;

    return UserModel.findOne({
      $or: [{ phone: decodedToken.id }, { email: decodedToken.id }]
    }).then(mapToUser);
  } catch (e) {
    return null;
  }
};
