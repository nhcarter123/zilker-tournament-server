import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import type { User, UserAuth } from './user/UserTypes';

const generateToken = (user: User): string => `JWT ${jwt.sign({ id: user.phone }, jwtSecret, {expiresIn: '22d'})}`;

export const getUserAuth = (user: User): UserAuth => {
  return {
    accessToken:  generateToken(user),
    refreshToken: generateToken(user)
  };
}