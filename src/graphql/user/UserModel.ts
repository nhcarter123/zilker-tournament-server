import * as mongoose from 'mongoose';
import { Role, User } from './UserTypes';

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
