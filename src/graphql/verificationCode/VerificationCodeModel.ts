import * as mongoose from 'mongoose';
import { VerificationCode } from './VerificationCodeTypes';

const Schema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    source: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  {
    collection: 'verification_codes'
  }
);

Schema.index({ createdAt: 1 }, { expires: 300 });

export default mongoose.model<VerificationCode>('VerificationCode', Schema);
