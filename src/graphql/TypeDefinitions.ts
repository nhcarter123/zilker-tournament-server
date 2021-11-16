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
    getUser(userId: ID!): User
      
    getActiveTournament: Tournament
    getTournaments: [Tournament!]!
    getTournament(tournamentId: ID!): Tournament
      
    getMatch(matchId: ID!): Match
    getMyMatch: Match
    getRound(tournamentId: ID!, roundId: ID!): Round
  }

  type Mutation {
    nextRound(tournamentId: ID!): Boolean!
    deleteRound(tournamentId: ID!, roundId: ID!): Boolean!
    joinTournament(tournamentId: ID!, userId: ID!): Boolean!
    createTournament(name: String!): Boolean!
      
    updateUserDetails(payload: UpdateUserDetailsPayload!): Boolean!
      
    verifyCode(code: String!): User
    sendVerificationCode(phone: String!): Boolean
      
    updateMatch(matchId: ID!, payload: UpdateMatchPayload!): Boolean!
    deleteMatch(tournamentId: ID!, roundId: ID!, matchId: ID!): Boolean!
  }
`;

const globalQuery: Array<DocumentNode> = [MatchType, TournamentTypes, VerificationCodeTypes, userTypes, queryTypes];

export default globalQuery;
