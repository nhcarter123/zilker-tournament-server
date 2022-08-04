import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  photo?: string;
  rating: number;
  matchesPlayed: number;
  role: Role;
  token?: string;
  organizationId?: string;
}

export enum Role {
  player = 'player',
  admin = 'admin'
}

const UserTypes: DocumentNode = gql`
  type User {
    _id: String
    firstName: String
    lastName: String
    phone: String!
    photo: String
    rating: Int
    matchesPlayed: Int!
    role: Role!
    token: String
    organizationId: String
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

export default UserTypes;
