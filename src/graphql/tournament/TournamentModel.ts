import * as mongoose from 'mongoose';
import moment from 'moment';
import { Tournament, TournamentStatus } from './TournamentTypes';

export interface TournamentMongo
  extends Omit<Tournament, '_id'>,
    mongoose.Document {
  _id: mongoose.Types.ObjectId;
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
    },
    tiebreakSeed: {
      type: Number,
      required: true,
      default: Math.random() > 0.5 ? 1 : 0
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true
    },
    location: {
      type: String
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
