import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import userTypes, { User } from './user/UserTypes';
import MatchType from './match/MatchTypes';
import VerificationCodeTypes from './verificationCode/VerificationCodeTypes';
import TournamentTypes from './tournament/TournamentTypes';

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
    getMyMatch(tournamentId: ID!): MatchWithUserInfo
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
    joinTournament(tournamentId: ID!, userId: ID!): JoinTournamentResult!
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
    matchUpdated(matchIds: [ID!]!): MatchWithUserInfo
    tournamentUpdated(tournamentId: ID!): TournamentUpdateResult
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`; // todo try subscriptions with non nullable again

const globalQuery: Array<DocumentNode> = [
  MatchType,
  TournamentTypes,
  VerificationCodeTypes,
  userTypes,
  queryTypes
];

export default globalQuery;
