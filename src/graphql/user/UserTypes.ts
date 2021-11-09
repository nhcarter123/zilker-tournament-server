import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  rating: number;
  auth: UserAuth;
};

export type UserAuth = {
  accessToken: string;
  refreshToken: string;
};

const userType: DocumentNode = gql`
  type User {
    _id: String
    firstName: String
    lastName: String
    phone: String
    rating: Int
    auth: UserAuth
  }

  type UserList {
    users: [User]
    count: Int
  }

  type UserAuth {
    accessToken: String
    refreshToken: String
  }
`;

export default userType;
