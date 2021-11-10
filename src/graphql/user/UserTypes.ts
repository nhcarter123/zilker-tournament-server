import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  rating: number;
  token: string;
}

const userType: DocumentNode = gql`
  type User {
    _id: String
    firstName: String
    lastName: String
    phone: String!
    rating: Int
    token: String
  }

  type UserList {
    users: [User]
    count: Int
  }

  input UpdateUserDetailsArgs {
    firstName: String!
    lastName: String!
    rating: Int!
  }
`;

export default userType;
