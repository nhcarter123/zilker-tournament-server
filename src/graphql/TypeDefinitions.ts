import { gql } from 'apollo-server';
import userTypes from './user/UserTypes';
import type { User } from './user/UserTypes';
import { DocumentNode } from 'graphql';
import VerificationCodeTypes from './verificationCode/VerificationCodeTypes';
import TournamentTypes from './tournament/TournamentTypes';

export type Context = {
  user: User,
};

const queryTypes: DocumentNode = gql`
  type Query {
    me: User
    getActiveTournament: Tournament
    getTournaments: [Tournament!]!
    users(search: String, first: Int!, after: Int): UserList
    user(id: ID!): User
  }

  type Mutation {
    joinTournament(tournamentId: String!, userId: String!): Boolean!
    createTournament(name: String!): Boolean!
    updateUserDetails(args: UpdateUserDetailsArgs!): User
    verifyCode(code: String!): User
    sendVerificationCode(phone: String!): Boolean
  }
`;

const globalQuery: Array<DocumentNode> = [TournamentTypes, VerificationCodeTypes, userTypes, queryTypes];

export default globalQuery;
