import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import UserTypes, { User } from './user/UserTypes';
import MatchType from './match/MatchTypes';
import TournamentTypes from './tournament/TournamentTypes';
import OrganizationType from './organization/OrganizationTypes';

export type Context = {
  user: Nullable<User>;
  ip: string;
  userAgent: string;
};

export type VerifiedContext = {
  user: User;
  ip: string;
  userAgent: string;
};

const queryTypes: DocumentNode = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  
  type CodeResponse {
    code: String!
  }

  type Query {
    # User
    me: User
    getMyStats: IStatsResult!
    getUser(userId: ID!): User
    getUsers(userIds: [ID!]!, filterTerm: String): [User!]!

    # Tournament
    getMyTournament: Tournament
    getTournaments: [TournamentWithOrganization!]!
    getTournament(tournamentId: ID!): Tournament

    # Match
    getMatch(matchId: ID!): MatchWithUserInfo
    getMyMatch(tournamentId: ID!): MatchWithUserInfo
    getMyChallengeMatch: MatchWithUserInfo
    getMyMatchHistory: HistoryResult!
    getRound(tournamentId: ID!, roundId: ID!): RoundWithUserInfo

    # Organization
    getOrganization(organizationId: ID!): Organization
    getOrganizations: [Organization!]!
  }

  type Mutation {
    # Tournament
    completeRound(
      tournamentId: ID!
      newRound: Boolean!
      textAlert: Boolean!
    ): Boolean!
    deleteRound(tournamentId: ID!, roundId: ID!): Boolean!
    joinTournament(organizationId: ID!, tournamentId: ID): JoinTournamentResult!
    kickPlayer(tournamentId: ID!, userId: ID!): Boolean!
    createTournament(name: String!): Tournament
    updateTournament(
      tournamentId: ID!
      payload: UpdateTournamentPayload!
    ): Boolean!
    uploadTournamentPhoto(tournamentId: ID!, photo: Upload!): Boolean!
    deleteTournamentPhoto(tournamentId: ID!): Boolean!

    # User
    logout: Boolean!
    refreshChallenge: User
    verifyCode(code: String!): User
    verifyPhone(phone: String!, token: String!): CodeResponse!
    verifyEmail(email: String!, password: String!, token: String!): Boolean!
    loginEmail(email: String!, password: String!, token: String!): User
    updateUserDetails(payload: UpdateUserDetailsPayload!): Boolean!
    uploadPhoto(photo: Upload!): Boolean!
    deletePhoto: Boolean!

    # Match
    joinChallenge(gameCode: ID!): Boolean!
    endChallenge(matchId: ID!): Boolean!
    updateMatch(matchId: ID!, payload: UpdateMatchPayload!): Boolean!

    # Organization
    createOrganization: Organization!
    updateOrganization(
      organizationId: ID!
      payload: UpdateOrganizationPayload!
    ): Boolean!
  }

  type Subscription {
    matchUpdated(matchIds: [ID!]!): MatchWithUserInfo
    tournamentUpdated(tournamentIds: [ID!]!): TournamentUpdateResult
    challengeUpdated(hostIds: [ID!]!): ChallengeUpdateResult
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
  UserTypes,
  OrganizationType,
  queryTypes
];

export default globalQuery;
