import { gql } from 'apollo-server';
import userTypes from './user/UserTypes';
import type { User } from './user/UserTypes';
import { DocumentNode } from 'graphql';
import VerificationCodeTypes from './verificationCode/VerificationCodeTypes';

export type Context = {
  user: User,
};

const queryTypes: DocumentNode = gql`
  type Query {
    me: User
    users(search: String, first: Int!, after: Int): UserList
    user(id: ID!): User
  }

  type Mutation {
    updateUserDetails(args: UpdateUserDetailsArgs!): User
    verifyCode(code: Int!): User
    sendVerificationCode(phone: String!): Boolean
    login(email: String!, password: String!): String
  }
`;

const globalQuery: Array<DocumentNode> = [VerificationCodeTypes, userTypes, queryTypes];

export default globalQuery;
