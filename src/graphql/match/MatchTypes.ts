import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { User } from '../user/UserTypes';
import { Tournament } from '../tournament/TournamentTypes';

export enum MatchResult {
  WhiteWon = 'whiteWon',
  BlackWon = 'blackWon',
  Draw = 'draw',
  DidNotStart = 'didNotStart'
}

export interface Match {
  _id: string;
  tournamentId: Nullable<string>;
  hostId: Nullable<string>;
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
  boardNumber?: number;
  result: MatchResult;
  completed: boolean;
}

export interface MatchWithUserInfo extends Omit<Match, 'white' | 'black'> {
  white: Nullable<User>;
  black: Nullable<User>;
}

export interface IHistoryResult {
  tournaments: Tournament[];
  matches: MatchWithUserInfo[];
}

const matchType: DocumentNode = gql`
  type HistoryResult {
    tournaments: [Tournament!]!
    matches: [MatchWithUserInfo!]!
  }

  type MatchWithUserInfo {
    _id: String!
    tournamentId: String
    hostId: String
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
    boardNumber: Int
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
`;

export default matchType;
