import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export enum MatchResult {
  whiteWon = 'whiteWon',
  blackWon = 'blackWon',
  draw = 'draw',
  didNotStart = 'didNotStart'
}

export interface Match {
  _id: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  boardNumber: number;
  result: MatchResult;
  completed: boolean;
}

export interface WeightedMatch extends Match {
  weight: number;
}

const matchType: DocumentNode = gql`
  type Match {
    _id: String!
    white: String!
    black: String!
    whiteRating: Int!
    blackRating: Int!
    boardNumber: Int!
    result: MatchResult!
    completed: Boolean!
  }

  type Round {
    _id: ID!
    completed: Boolean!
    matches: [Match!]!
  }

  input UpdateMatchPayload {
    result: MatchResult!
  }

  input UpdateTournamentPayload {
    name: String
    isDeleted: Boolean
  }
`;

export default matchType;
