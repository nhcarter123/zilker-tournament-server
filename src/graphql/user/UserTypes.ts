import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import * as mongoose from 'mongoose';

export enum Role {
  player = 'player',
  admin = 'admin'
}

export interface User extends mongoose.Document {
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
    role: Role!
  }

  enum Role {
    player
    admin
  }

  type UserList {
    users: [User]
    count: Int
  }

  input UpdateUserDetailsPayload {
    firstName: String
    lastName: String
    rating: Int
  }
`;

export default userType;
