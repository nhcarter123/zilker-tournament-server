import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import { User } from '../user/UserTypes';

export enum MatchResult {
  whiteWon = 'whiteWon',
  blackWon = 'blackWon',
  draw = 'draw',
  didNotStart = 'didNotStart'
}

export type MatchResponse = {
  white: User;
  black: User;
  whiteRating: number;
  blackRating: number;
  result?: MatchResult;
};

export type Match = {
  white: string;
  black: string;
  whiteRating: number;
  blackRating: number;
  result?: MatchResult;
};

const matchType: DocumentNode = gql`
  type Match {
    white: User!
    black: User!
    result: MatchResult
  }
`;

export default matchType;
