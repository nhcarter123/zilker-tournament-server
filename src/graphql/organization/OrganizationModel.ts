import * as mongoose from 'mongoose';
import { Organization } from './OrganizationTypes';

export interface OrganizationMongo
  extends Omit<Organization, '_id'>,
    mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }
  },
  {
    collection: 'organizations'
  }
);

export default mongoose.model<Organization>('Organization', Schema);
