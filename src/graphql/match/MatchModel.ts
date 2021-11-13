import * as mongoose from 'mongoose';
import { MatchResult } from './MatchTypes';

export interface MatchMongo extends mongoose.Document {
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  result?: MatchResult;
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
    result: {
      type: String
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
