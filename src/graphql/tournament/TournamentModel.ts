import * as mongoose from 'mongoose';
import moment from 'moment';
import { RoundPreview, Standing, TournamentStatus } from './TournamentTypes';

export interface TournamentMongo extends mongoose.Document {
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: RoundPreview[];
  standings: Standing[];
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
      default: TournamentStatus.created
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
    standings: [
      {
        userId: {
          type: String,
          required: true
        },
        position: {
          type: Number,
          required: true
        },
        score: {
          type: Number,
          required: true
        },
        win: {
          type: Number,
          required: true
        },
        loss: {
          type: Number,
          required: true
        },
        draw: {
          type: Number,
          required: true
        },
        bye: {
          type: Number,
          required: true
        }
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
