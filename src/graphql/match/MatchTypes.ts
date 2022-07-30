import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { User } from '../user/UserTypes';

export enum MatchResult {
  whiteWon = 'whiteWon',
  blackWon = 'blackWon',
  draw = 'draw',
  didNotStart = 'didNotStart'
}

export interface Match {
  _id: string;
  tournamentId: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  whiteScore: number;
  blackScore: number;
  newWhiteRating?: number;
  newBlackRating?: number;
  whiteMatchesPlayed: number;
  blackMatchesPlayed: number;
  boardNumber: number;
  result: MatchResult;
  completed: boolean;
}

export interface MatchWithUserInfo extends Omit<Match, 'white' | 'black'> {
  white: Nullable<User>;
  black: Nullable<User>;
}

const matchType: DocumentNode = gql`
  type MatchWithUserInfo {
    _id: String!
    tournamentId: String!
    white: User
    black: User
    whiteRating: Int!
    blackRating: Int!
    whiteScore: Float!
    blackScore: Float!
    newWhiteRating: Int
    newBlackRating: Int
    whiteMatchesPlayed: Int!
    blackMatchesPlayed: Int!
    boardNumber: Int!
    result: MatchResult!
    completed: Boolean!
  }

  type RoundWithUserInfo {
    _id: ID!
    completed: Boolean!
    matches: [MatchWithUserInfo!]!
  }

  input UpdateMatchPayload {
    result: MatchResult!
  }

  input UpdateTournamentPayload {
    name: String
    date: Date
    status: TournamentStatus
    pairingAlgorithm: PairingAlgorithm
    isDeleted: Boolean
  }
`;

export default matchType;
