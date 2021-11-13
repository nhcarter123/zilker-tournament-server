import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import * as mongoose from 'mongoose';

export interface VerificationCode extends mongoose.Document {
  phone: string;
  code: string;
}

const VerificationCodeType: DocumentNode = gql`
  type VerificationCode {
    _id: String!
    phone: String!
    code: String!
  }
`;

export default VerificationCodeType;
