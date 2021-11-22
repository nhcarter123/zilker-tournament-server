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
    getUsers(userIds: [ID!]!, filterTerm: String): [User!]!
      
    getActiveTournament: Tournament
    getTournaments: [Tournament!]!
    getTournament(tournamentId: ID!): Tournament
      
    getMatch(matchId: ID!): Match
    getMyMatch: Match
    getRound(tournamentId: ID!, roundId: ID!): Round
  }

  type Mutation {
#   Tournament
    completeRound(tournamentId: ID!, newRound: Boolean!): Boolean!
    deleteRound(tournamentId: ID!, roundId: ID!): Boolean!
    joinTournament(tournamentId: ID!, userId: ID!): Boolean!
    kickPlayer(tournamentId: ID!, userId: ID!): Boolean!
    createTournament(name: String!): Boolean!
    updateTournament(payload: UpdateTournamentPayload!): Boolean!
      
#   User
    verifyCode(code: String!): User
    sendVerificationCode(phone: String!): Boolean
    updateUserDetails(payload: UpdateUserDetailsPayload!): Boolean!

      #   Matches
    updateMatch(matchId: ID!, payload: UpdateMatchPayload!): Boolean!
    deleteMatch(tournamentId: ID!, roundId: ID!, matchId: ID!): Boolean!
  }
`;

const globalQuery: Array<DocumentNode> = [MatchType, TournamentTypes, VerificationCodeTypes, userTypes, queryTypes];

export default globalQuery;
