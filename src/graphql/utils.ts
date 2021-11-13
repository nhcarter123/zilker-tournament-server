import * as jwt from 'jsonwebtoken';

export const generateToken = (phone: string): string =>
  jwt.sign({ id: phone }, `${process.env.SECRET}`, { expiresIn: '22d' });
