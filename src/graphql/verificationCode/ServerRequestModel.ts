import * as mongoose from 'mongoose';

export interface ServerRequest extends mongoose.Document {
  ip: string;
  clientId: string;
}

const Schema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    ip: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    }
  },
  {
    collection: 'server_requests'
  }
);

export default mongoose.model<ServerRequest>('ServerRequest', Schema);
