import * as mongoose from 'mongoose';
import { Role } from './UserTypes';

export interface User extends mongoose.Document {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  photo?: string;
  rating: number;
  matchesPlayed: number;
  token?: string;
  role: Role;
}

const Schema = new mongoose.Schema(
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    phone: {
      type: String,
      required: true,
      index: true // todo check this
    },
    photo: {
      type: String
    },
    matchesPlayed: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 1000
    },
    token: {
      type: String
    },
    role: {
      type: String,
      required: true,
      default: Role.player
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'users'
  }
);

export default mongoose.model<User>('User', Schema);
