import { gql } from 'apollo-server';
import { DocumentNode } from 'graphql';
import * as mongoose from 'mongoose';
import { User } from '../user/UserTypes';

export enum TournamentStatus {
  registration = 'registration',
  completed = 'completed',
  inactive = 'inactive'
}

export enum MatchResult {
  whiteWon = 'whiteWon',
  blackWon = 'blackWon',
  draw = 'draw',
  didNotStart = 'didNotStart'
}

export type Match = {
  white: User;
  black: User;
  result: MatchResult;
};

export type Round = {
  complete: boolean;
  matches: Match[];
};

export interface Tournament extends mongoose.Document {
  _id: string;
  name: string;
  date: Date;
  status: TournamentStatus;
  players: string[];
  rounds: string[];
}

// export interface TournamentResult
//   extends Omit<Tournament, 'players' | 'rounds'> {
//   players: User[];
//   rounds: Round[];
// }

// export interface TournamentResultWithStats extends TournamentResult {
//   medianRating: number;
//   playerCount: number;
// }

const TournamentType: DocumentNode = gql`
  scalar Date

  enum MatchResult {
    whiteWon
    blackWon
    draw
    didNotStart
  }

  enum TournamentStatus {
    inactive
    registration
    completed
  }

  type Match {
    white: User!
    black: User!
    result: MatchResult
  }

  type Round {
    completed: Boolean!
    matches: [String!]!
  }

  type Tournament {
    _id: String!
    name: String!
    date: Date!
    status: TournamentStatus!
    players: [String!]!
    rounds: [Round!]!
  }
`;

export default TournamentType;
