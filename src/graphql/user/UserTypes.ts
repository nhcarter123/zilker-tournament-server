import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export enum Role {
  player = 'player',
  admin = 'admin'
}

const userType: DocumentNode = gql`
  type User {
    _id: String
    firstName: String
    lastName: String
    phone: String!
    rating: Int
    matchesPlayed: Int!
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
