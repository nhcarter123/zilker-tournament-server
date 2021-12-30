import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import userTypes from './user/UserTypes';
import MatchType from './match/MatchTypes';
import VerificationCodeTypes from './verificationCode/VerificationCodeTypes';
import TournamentTypes from './tournament/TournamentTypes';
import { User } from './user/UserModel';

export type Context = {
  user: User;
};

const queryTypes: DocumentNode = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    me: User
    getUser(userId: ID!): User
    getUsers(userIds: [ID!]!, filterTerm: String): [User!]!

    getMyTournament: Tournament
    getTournaments: [Tournament!]!
    getTournament(tournamentId: ID!): Tournament

    getMatch(matchId: ID!): MatchWithUserInfo
    getMyMatch: MatchWithUserInfo
    getRound(tournamentId: ID!, roundId: ID!): Round
  }

  type Mutation {
    #   Tournament
    completeRound(
      tournamentId: ID!
      newRound: Boolean!
      textAlert: Boolean!
    ): Boolean!
    deleteRound(tournamentId: ID!, roundId: ID!): Boolean!
    joinTournament(tournamentId: ID!, userId: ID!): Boolean!
    kickPlayer(tournamentId: ID!, userId: ID!): Boolean!
    createTournament(name: String!): Boolean!
    updateTournament(
      tournamentId: ID!
      payload: UpdateTournamentPayload!
    ): Boolean!

    #   User
    verifyCode(code: String!): User
    sendVerificationCode(phone: String!): Boolean
    updateUserDetails(payload: UpdateUserDetailsPayload!): Boolean!
    uploadPhoto(photo: Upload!): Boolean!
    deletePhoto: Boolean!

    #   Matches
    updateMatch(matchId: ID!, payload: UpdateMatchPayload!): Boolean!
    deleteMatch(tournamentId: ID!, roundId: ID!, matchId: ID!): Boolean!
  }

  type Subscription {
    matchUpdated(matchIds: [ID!]!): Match
    newRoundStarted(tournamentId: ID!): NewRoundStartedData
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

const globalQuery: Array<DocumentNode> = [
  MatchType,
  TournamentTypes,
  VerificationCodeTypes,
  userTypes,
  queryTypes
];

export default globalQuery;
