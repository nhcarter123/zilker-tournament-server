import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';

export enum MatchResult {
  whiteWon = 'whiteWon',
  blackWon = 'blackWon',
  draw = 'draw',
  didNotStart = 'didNotStart'
}

export type Match = {
  _id: string;
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  result: MatchResult;
  completed: boolean;
};

const matchType: DocumentNode = gql`
  type Match {
    _id: String!
    white: String!
    black: String!
    whiteRating: Int!
    blackRating: Int!
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
`;

export default matchType;
