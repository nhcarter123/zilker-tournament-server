import * as mongoose from 'mongoose';
import { VerificationCode } from './VerificationCodeTypes';

const Schema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    phone: {
      type: String,
      required: true
    },
    code: {
      type: Number,
      required: true
    }
  },
  {
    collection: 'verification_codes'
  }
);

Schema.index({ createdAt: 1 }, { expires: 60 });

export default mongoose.model<VerificationCode>('VerificationCode', Schema);
