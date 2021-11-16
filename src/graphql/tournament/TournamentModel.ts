import * as mongoose from 'mongoose';
import moment from 'moment';
import { RoundPreview, TournamentStatus } from './TournamentTypes';

export interface TournamentMongo extends mongoose.Document {
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: RoundPreview[];
  totalRounds: number;
}

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: TournamentStatus.inactive
    },
    date: {
      type: Date,
      required: true,
      default: moment().toDate()
    },
    players: [
      {
        type: String,
        required: true
      }
    ],
    rounds: [
      {
        completed: {
          type: Boolean,
          required: true,
          default: false
        },
        matches: [
          {
            type: String,
            required: true
          }
        ]
      }
    ],
    totalRounds: {
      type: Number,
      required: true,
      default: 5
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'tournaments'
  }
);

export default mongoose.model<TournamentMongo>('Tournaments', Schema);
