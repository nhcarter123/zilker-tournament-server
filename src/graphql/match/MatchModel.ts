import * as mongoose from 'mongoose';
import { Match, MatchResult } from './MatchTypes';

export interface MatchMongo extends Omit<Match, '_id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const Schema = new mongoose.Schema(
  {
    tournamentId: {
      type: String,
      required: true
    },
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
    whiteScore: {
      type: Number,
      required: true,
      default: 0
    },
    blackScore: {
      type: Number,
      required: true,
      default: 0
    },
    whiteMatchesPlayed: {
      type: Number,
      required: true
    },
    blackMatchesPlayed: {
      type: Number,
      required: true
    },
    newWhiteRating: {
      type: Number
    },
    newBlackRating: {
      type: Number
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
