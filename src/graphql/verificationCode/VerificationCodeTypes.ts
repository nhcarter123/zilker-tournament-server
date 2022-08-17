import * as mongoose from 'mongoose';

export interface VerificationCode extends mongoose.Document {
  phone: string;
  email: string;
  password: string;
  code: string;
}
