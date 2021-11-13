import { gql } from 'apollo-server';
import type { User } from './user/UserTypes';
import { DocumentNode } from 'graphql';
import userTypes from './user/UserTypes';
import MatchType from './match/MatchTypes';
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
    getTournament(tournamentId: String!): Tournament
    users(search: String, first: Int!, after: Int): UserList
    user(id: ID!): User
  }

  type Mutation {
    nextRound(tournamentId: String!): Boolean!
    joinTournament(tournamentId: String!, userId: String!): Boolean!
    createTournament(name: String!): Boolean!
    updateUserDetails(args: UpdateUserDetailsArgs!): Boolean!
    verifyCode(code: String!): User
    sendVerificationCode(phone: String!): Boolean
  }
`;

const globalQuery: Array<DocumentNode> = [MatchType, TournamentTypes, VerificationCodeTypes, userTypes, queryTypes];

export default globalQuery;
