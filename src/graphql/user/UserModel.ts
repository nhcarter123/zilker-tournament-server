import * as mongoose from 'mongoose';
import { User } from './UserTypes';

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
    rating: {
      type: Number
    },
    auth: {
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      }
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
