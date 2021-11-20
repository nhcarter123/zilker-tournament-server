import * as mongoose from 'mongoose';
import { MatchResult } from './MatchTypes';

export interface MatchMongo extends mongoose.Document {
  _id: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  boardNumber: number;
  result: MatchResult;
  completed: boolean;
}

const Schema = new mongoose.Schema(
  {
    white: {
      type: String,
      required: true
    },
    black: {
      type: String,
      required: true
    },
    whiteRating: {
      type: Number,
      required: true
    },
    blackRating: {
      type: Number,
      required: true
    },
    boardNumber: {
      type: Number,
      required: true
    },
    result: {
      type: String,
      required: true,
      default: MatchResult.didNotStart
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'match'
  }
);

export default mongoose.model<MatchMongo>('Match', Schema);
