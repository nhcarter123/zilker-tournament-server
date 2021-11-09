import { gql } from 'apollo-server';
import userTypes from './user/UserTypes';
import postTypes from './posts/PostTypes';
import type { User } from './user/UserTypes';
import { DocumentNode } from 'graphql';

export type Context = {
  user: User,
};

const queryTypes: DocumentNode = gql`
  type Query {
    me: User
    users(search: String, first: Int!, after: Int): UserList
    user(id: ID!): User
    posts(search: String, first: Int!, after: Int): PostConnection
    post(id: ID!): Post
  }

  type Mutation {
    verifyCode(code: Int!): User
    sendVerificationCode(phone: String!): Boolean
    addUser(name: String!, email: String!, password: String!): UserAuth
    login(email: String!, password: String!): UserAuth
    postAdd(title: String!, description: String!): Post
  }
`;

const globalQuery: Array<DocumentNode> = [postTypes, userTypes, queryTypes];

export default globalQuery;
